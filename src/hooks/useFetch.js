import { useCallback, useEffect, useState } from "react";
import { apiFetch, peekCache } from "../utils/api";

/**
 * Fetch JSON through the shared cached / rate-limited / retrying layer.
 * Returns { data, loading, error, retry }.
 */
export default function useFetch(url, options) {
  const [attempt, setAttempt] = useState(0);
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
    const cached = attempt ? null : peekCache(url);
    setState({ url, data: cached, loading: !cached, error: null });

    apiFetch(url, { ...options, force: attempt > 0 })
      .then((data) => !cancelled && setState({ url, data, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ url, data: null, loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
    // options is expected to be stable (module-level constant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Never hand back data that belongs to a previous URL
  if (state.url !== url) {
    const cached = peekCache(url);
    return { data: cached, loading: Boolean(url) && !cached, error: null, retry };
  }
  return { ...state, retry };
}
