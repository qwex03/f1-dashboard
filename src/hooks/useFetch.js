import { useEffect, useState } from "react";
import { apiFetch, peekCache } from "../utils/api";

export default function useFetch(url) {
  const [state, setState] = useState(() => {
    const cached = peekCache(url);
    return { url, data: cached, loading: Boolean(url) && !cached, error: null };
  });

  useEffect(() => {
    if (!url) {
      setState({ url, data: null, loading: false, error: null });
      return undefined;
    }

    let cancelled = false;
    const cached = peekCache(url);
    setState({ url, data: cached, loading: !cached, error: null });

    apiFetch(url)
      .then((data) => !cancelled && setState({ url, data, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ url, data: null, loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Never hand back data that belongs to a previous URL
  if (state.url !== url) {
    return { data: peekCache(url), loading: Boolean(url) && !peekCache(url), error: null };
  }
  return { data: state.data, loading: state.loading, error: state.error };
}
