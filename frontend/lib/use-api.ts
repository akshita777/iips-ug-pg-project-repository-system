"use client";

import * as React from "react";
import api from "./api";
import { apiErrorMessage } from "./types";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refresh: () => void;
}

/** Standard GET hook with loading plus error states for every list view. */
export function useApi<T>(path: string | null, fallback = "Could not load data."): UseApiState<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    api
      .get<T>(path)
      .then((res) => setData(res.data))
      .catch((e) => setError(apiErrorMessage(e, fallback)))
      .finally(() => setLoading(false));
  }, [path, nonce, fallback]);

  const refresh = React.useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refresh };
}
