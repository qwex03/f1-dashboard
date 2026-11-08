// Shared fetch layer for every API call in the app.
//
// The Jolpica (Ergast) API allows 4 requests/second in bursts and 500/hour sustained.
// To stay reliable under those limits this module:
//   - queues requests so no more than 4 start in any one-second window,
//   - retries network errors, timeouts, 429 and 5xx responses with exponential backoff,
//   - caches responses in localStorage, keeping finished seasons for days instead of minutes,
//   - falls back to the last cached copy (even expired) when the network still fails.

export const API = "https://api.jolpi.ca/ergast/f1";

const STORAGE_PREFIX = "apexf1:v2:";
const MAX_PER_SECOND = 4;
const TIMEOUT_MS = 12000;
const MAX_ATTEMPTS = 4;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** How long a response stays fresh. Past seasons never change; the current one does. */
function ttlFor(url) {
  const currentYear = new Date().getFullYear();
  const season = url.match(/\/f1\/(\d{4})\//);
  if (season && Number(season[1]) < currentYear) return 7 * DAY;
  if (/\/f1\/\d{4}\/\d+\//.test(url)) return 6 * HOUR; // a specific, finished round
  if (/rss2json/.test(url)) return 15 * MINUTE;
  return 10 * MINUTE;
}

// ---------------------------------------------------------------------------
// Persistent cache (localStorage, with eviction when the quota is reached)

function storageKey(url) {
  return STORAGE_PREFIX + url;
}

function readEntry(url) {
  try {
    const raw = localStorage.getItem(storageKey(url));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function evictOldest(count = 20) {
  try {
    const entries = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith("apexf1:")) continue;
      try {
        entries.push([key, JSON.parse(localStorage.getItem(key))?.at ?? 0]);
      } catch {
        entries.push([key, 0]);
      }
    }
    entries.sort((a, b) => a[1] - b[1]).slice(0, count).forEach(([key]) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

function writeEntry(url, data) {
  const value = JSON.stringify({ at: Date.now(), data });
  try {
    localStorage.setItem(storageKey(url), value);
  } catch {
    evictOldest();
    try {
      localStorage.setItem(storageKey(url), value);
    } catch {
      // Storage unavailable: the in-memory cache still works for this visit
    }
  }
}

function freshData(url) {
  const entry = readEntry(url);
  return entry && Date.now() - entry.at < ttlFor(url) ? entry.data : null;
}

// ---------------------------------------------------------------------------
// Rate-limited queue

const queue = [];
let starts = [];
// Monotonic clock: unaffected by system clock changes
const clock = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function pump() {
  const now = clock();
  starts = starts.filter((t) => now - t < 1000);
  while (queue.length && starts.length < MAX_PER_SECOND) {
    starts.push(clock());
    queue.shift()();
  }
  if (queue.length) setTimeout(pump, Math.max(10, 1000 - (now - starts[0]) + 10));
}

function throttled(task) {
  return new Promise((resolve, reject) => {
    queue.push(() => task().then(resolve, reject));
    pump();
  });
}

// ---------------------------------------------------------------------------
// Fetch with timeout + retries

class HttpError extends Error {
  constructor(status, retryAfter) {
    super(
      status === 429
        ? "trop de requêtes envoyées à l'API F1, réessaie dans un instant"
        : `l'API F1 rencontre un problème (HTTP ${status})`
    );
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err) {
  if (err instanceof HttpError) return err.status === 429 || err.status >= 500;
  return true; // network failure, CORS hiccup, timeout, invalid JSON
}

function backoff(attempt, err) {
  if (err?.retryAfter) return Math.min(err.retryAfter * 1000, 15000);
  const base = err?.status === 429 ? 1500 : 500;
  return base * 2 ** attempt + Math.random() * 300; // 0.5s, 1s, 2s… plus jitter
}

async function fetchOnce(url, validate) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller && setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!res.ok) {
      const retryAfter = Number(res.headers.get("Retry-After")) || null;
      throw new HttpError(res.status, retryAfter);
    }
    const json = await res.json();
    if (validate) validate(json);
    return json;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("l'API F1 ne répond pas (délai dépassé)");
    if (err instanceof TypeError) throw new Error("connexion impossible à l'API F1, vérifie ta connexion");
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function request(url, validate) {
  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await throttled(() => fetchOnce(url, validate));
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === MAX_ATTEMPTS - 1) break;
      await sleep(backoff(attempt, err));
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Public API

const inflight = new Map(); // url -> Promise, so identical concurrent calls share one request
const memory = new Map(); // url -> data loaded during this visit

/**
 * Cached, rate-limited, retrying JSON fetch.
 * `validate(json)` may throw to reject a 200 response whose body reports an error.
 */
export function apiFetch(url, { validate, force = false } = {}) {
  if (!force) {
    if (memory.has(url) && freshData(url)) return Promise.resolve(memory.get(url));
    const fresh = freshData(url);
    if (fresh) {
      memory.set(url, fresh);
      return Promise.resolve(fresh);
    }
  }
  if (inflight.has(url)) return inflight.get(url);

  const p = request(url, validate)
    .then((data) => {
      memory.set(url, data);
      writeEntry(url, data);
      return data;
    })
    .catch((err) => {
      // Better slightly old data than an error screen
      const stale = readEntry(url);
      if (stale) return stale.data;
      throw err;
    })
    .finally(() => inflight.delete(url));

  inflight.set(url, p);
  return p;
}

/** Synchronous peek used to render cached data on first paint. */
export function peekCache(url) {
  return url ? freshData(url) : null;
}
