import { useEffect, useState } from "react";

// Ergast links each driver/circuit to its English Wikipedia article.
// We look up the French version of that article and fall back to English.
const cache = new Map();

function titleFromUrl(url) {
  try {
    const path = new URL(url).pathname.split("/wiki/")[1];
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

async function summary(lang, title) {
  const res = await fetch(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.type === "disambiguation") throw new Error("disambiguation");
  return {
    lang,
    title: json.title,
    extract: json.extract,
    image: json.originalimage?.source ?? json.thumbnail?.source ?? null,
    url: json.content_urls?.desktop?.page,
  };
}

async function load(enUrl) {
  const enTitle = titleFromUrl(enUrl);
  if (!enTitle) throw new Error("no title");

  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=fr&redirects=1&format=json&origin=*&titles=${encodeURIComponent(enTitle)}`
    );
    const json = await res.json();
    const page = Object.values(json?.query?.pages ?? {})[0];
    const frTitle = page?.langlinks?.[0]?.["*"];
    if (frTitle) return await summary("fr", frTitle);
  } catch {
    // fall through to English
  }
  return summary("en", enTitle);
}

export default function useWikiSummary(enUrl) {
  const [state, setState] = useState({ data: null, loading: Boolean(enUrl) });

  useEffect(() => {
    if (!enUrl) {
      setState({ data: null, loading: false });
      return undefined;
    }
    let cancelled = false;
    if (!cache.has(enUrl)) cache.set(enUrl, load(enUrl).catch(() => null));
    setState({ data: null, loading: true });
    cache.get(enUrl).then((data) => !cancelled && setState({ data, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [enUrl]);

  return state;
}
