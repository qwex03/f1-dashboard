// Shared fetch layer: caches responses and keeps the Jolpica/Ergast API under its
// rate limit (≈4 requests per second), so detail pages that need many calls stay reliable.

export const API = "https://api.jolpi.ca/ergast/f1";

const TTL = 10 * 60 * 1000; // 10 minutes
const STORAGE_PREFIX = "apexf1:";
const MAX_PER_SECOND = 4;

const memory = new Map(); // url -> Promise<json>
const queue = [];
let starts = []; // timestamps of recent request starts

function readStorage(url) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + url);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < TTL ? data : null;
  } catch {
    return null;
  }
}

function writeStorage(url, data) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + url, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage full or unavailable: memory cache still works
  }
}

// Monotonic clock: unaffected by system clock changes
const clock = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function pump() {
  const now = clock();
  starts = starts.filter((t) => now - t < 1000);
  while (queue.length && starts.length < MAX_PER_SECOND) {
    starts.push(clock());
    queue.shift()();
  }
  if (queue.length) setTimeout(pump, 1000 - (now - starts[0]) + 10);
}

function throttled(task) {
  return new Promise((resolve, reject) => {
    queue.push(() => task().then(resolve, reject));
    pump();
  });
}

async function request(url, retries = 2) {
  const res = await throttled(() => fetch(url));
  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, 1200));
    return request(url, retries - 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Cached, rate-limited JSON fetch. Identical concurrent calls share one request. */
export function apiFetch(url) {
  if (memory.has(url)) return memory.get(url);

  const stored = readStorage(url);
  if (stored) {
    const p = Promise.resolve(stored);
    memory.set(url, p);
    return p;
  }

  const p = request(url).then(
    (data) => {
      writeStorage(url, data);
      return data;
    },
    (err) => {
      memory.delete(url); // allow a retry later
      throw err;
    }
  );
  memory.set(url, p);
  return p;
}

/** Synchronous peek used to render cached data on first paint. */
export function peekCache(url) {
  return url ? readStorage(url) : null;
}
