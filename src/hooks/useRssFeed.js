import useFetch from "./useFetch";

// rss2json answers 200 with { status: "error" } on failure: treat that as an error
// so it is retried and never cached.
const RSS_OPTIONS = {
  validate(json) {
    if (json?.status !== "ok") throw new Error(json?.message || "Flux RSS indisponible");
  },
};

export default function useRssFeed(url) {
  const feedUrl = url
    ? `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=cgghbbjnpdofxcpe2rzv8iyempygkanabi843xtn&count=25`
    : null;
  const { data, loading, error, retry } = useFetch(feedUrl, RSS_OPTIONS);
  return { items: data?.items ?? [], loading, error, retry };
}
