import { useEffect, useState, ReactNode } from "react";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/navigation";

export interface ResourceDetailViewProps<T> {
  namespace?: string;
  name: string;
  fetchDetail: () => Promise<T>;
  fetchEvents?: () => Promise<kube.EventInfo[]>;
  eventChannel?: string;
  resourceLabel: string;
  toolbar?: ReactNode;
  children: (detail: T, events: kube.EventInfo[]) => ReactNode;
}

export function ResourceDetailView<T>({
  namespace,
  name,
  fetchDetail,
  fetchEvents,
  eventChannel,
  resourceLabel,
  toolbar,
  children,
}: ResourceDetailViewProps<T>) {
  const { goBack } = useNavigation();
  const [detail, setDetail] = useState<T | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (fetchEvents) {
          const [d, e] = await Promise.all([fetchDetail(), fetchEvents()]);
          if (!cancelled) {
            setDetail(d);
            setEvents(e || []);
          }
        } else {
          const d = await fetchDetail();
          if (!cancelled) {
            setDetail(d);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, name]);

  // Live updates
  useEffect(() => {
    if (!eventChannel) return;

    const cancel = EventsOn(
      eventChannel,
      (event: {
        type: string;
        data: { name: string; namespace?: string };
      }) => {
        if (event.data.name !== name) return;
        if (namespace !== undefined && event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError(`This ${resourceLabel} has been deleted`);
          setDetail(null);
          return;
        }

        if (fetchEvents) {
          Promise.all([fetchDetail(), fetchEvents()])
            .then(([d, e]) => {
              setDetail(d);
              setEvents(e || []);
            })
            .catch(() => {});
        } else {
          fetchDetail()
            .then((d) => setDetail(d))
            .catch(() => {});
        }
      },
    );

    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, name, eventChannel]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading {resourceLabel} details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          &larr; Back
        </Button>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
          {toolbar}
        </div>
        {children(detail, events)}
      </div>
    </div>
  );
}
