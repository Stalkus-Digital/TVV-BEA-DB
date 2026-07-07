"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

/**
 * Tiny SWR-style data hook — no React Query dependency.
 *
 * Usage:
 *   const { data, error, loading, refetch } = useQuery(() => guidesService.list());
 *
 * `deps` is the dependency array — pass [] for a one-shot fetch, or pass values
 * that should trigger a refetch when they change.
 */

export interface QueryState<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await fetcher();
      if (!mounted.current) return;
      setData(result);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof ApiError ? err : ApiError.fromUnknown(err));
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refetch: run };
}
