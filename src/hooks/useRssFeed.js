import { useState, useEffect } from "react";

export default function useRssFeed(url) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=cgghbbjnpdofxcpe2rzv8iyempygkanabi843xtn&count=25`
        );
        const data = await res.json();

        if (data.status === "ok") {
          console.log(`Nombre d'items: ${data.items.length}`);
          setItems(data.items);
        } else {
          setError("Erreur lors de la récupération du RSS");
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [url]);

  return { items, loading, error };
}
