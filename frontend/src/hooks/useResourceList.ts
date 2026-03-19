import { useEffect, useRef, useState } from "react";
import { EventsOn } from "../../wailsjs/runtime/runtime";

interface UseResourceListOptions<T> {
  fetchItems: () => Promise<T[]>;
  eventChannel: string;
  getKey: (item: T) => string;
  sortItems: (a: T, b: T) => number;
  startWatch?: () => Promise<void>;
  stopWatch?: () => Promise<void>;
  onError?: (error: string) => void;
  deps?: unknown[];
}

export function useResourceList<T>({
  fetchItems,
  eventChannel,
  getKey,
  sortItems,
  startWatch,
  stopWatch,
  onError,
  deps = [],
}: UseResourceListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep latest callbacks in refs to avoid stale closures
  const ref = useRef({ fetchItems, getKey, sortItems, startWatch, stopWatch, onError });
  ref.current = { fetchItems, getKey, sortItems, startWatch, stopWatch, onError };

  // Load initial data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ref.current
      .fetchItems()
      .then((result) => {
        if (!cancelled) setItems(result || []);
      })
      .catch((e: unknown) => {
        if (!cancelled) ref.current.onError?.(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Real-time updates via watcher events
  useEffect(() => {
    const cancel = EventsOn(
      eventChannel,
      (event: { type: string; data: T }) => {
        const { getKey: key, sortItems: sort } = ref.current;
        const eventKey = key(event.data);
        setItems((prev) => {
          switch (event.type) {
            case "ADDED":
            case "MODIFIED": {
              const idx = prev.findIndex((item) => key(item) === eventKey);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = event.data;
                return next;
              }
              return [...prev, event.data].sort(sort);
            }
            case "DELETED":
              return prev.filter((item) => key(item) !== eventKey);
            default:
              return prev;
          }
        });
      },
    );

    ref.current.startWatch?.().catch((e: unknown) => {
      ref.current.onError?.(String(e));
    });

    return () => {
      cancel();
      ref.current.stopWatch?.().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { items, loading };
}
