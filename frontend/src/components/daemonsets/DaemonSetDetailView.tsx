import { useEffect, useState } from "react";
import {
  GetDaemonSetDetail,
  GetDaemonSetEvents,
} from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

interface DaemonSetDetailViewProps {
  namespace: string;
  name: string;
}

function daemonSetStatus(ds: kube.DaemonSetDetail): string {
  if (ds.desired === 0) return "Scaled Down";
  if (ds.ready === ds.desired) return "Ready";
  if (ds.ready < ds.desired) return "Progressing";
  return "Ready";
}

export function DaemonSetDetailView({
  namespace,
  name,
}: DaemonSetDetailViewProps) {
  const { goBack } = useNavigation();
  const [ds, setDs] = useState<kube.DaemonSetDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [dsDetail, dsEvents] = await Promise.all([
          GetDaemonSetDetail(namespace, name),
          GetDaemonSetEvents(namespace, name),
        ]);
        setDs(dsDetail);
        setEvents(dsEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates — refetch detail when this daemonset changes
  useEffect(() => {
    const cancel = EventsOn(
      "daemonsets:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This daemonset has been deleted");
          setDs(null);
          return;
        }

        Promise.all([
          GetDaemonSetDetail(namespace, name),
          GetDaemonSetEvents(namespace, name),
        ])
          .then(([dsDetail, dsEvents]) => {
            setDs(dsDetail);
            setEvents(dsEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading daemonset details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to DaemonSets
        </Button>
      </div>
    );
  }

  if (!ds) return null;

  const status = daemonSetStatus(ds);

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* DaemonSet overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {ds.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{ds.namespace}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Desired", value: String(ds.desired) },
              { label: "Current", value: String(ds.current) },
              { label: "Ready", value: String(ds.ready) },
              { label: "Up-to-Date", value: String(ds.upToDate) },
              { label: "Age", value: ds.age },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-950 rounded-sm px-3 py-2">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                  {s.value || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <div>
              <span className="text-zinc-500">Update Strategy</span>
              <p className="text-zinc-200">{ds.updateStrategy || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Min Ready Seconds</span>
              <p className="text-zinc-200">{ds.minReadySeconds}</p>
            </div>
            <div>
              <span className="text-zinc-500">Revision History Limit</span>
              <p className="text-zinc-200">
                {ds.revisionHistoryLimit != null
                  ? String(ds.revisionHistoryLimit)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Available</span>
              <p className="text-zinc-200">{ds.available}</p>
            </div>
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{ds.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {ds.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Selector */}
        {ds.selector && Object.keys(ds.selector).length > 0 && (
          <section>
            <SectionHeading>Selector</SectionHeading>
            <KeyValueList entries={ds.selector} />
          </section>
        )}

        {/* Node Selector */}
        {ds.nodeSelector && Object.keys(ds.nodeSelector).length > 0 && (
          <section>
            <SectionHeading>Node Selector</SectionHeading>
            <KeyValueList entries={ds.nodeSelector} />
          </section>
        )}

        {/* Images */}
        {ds.images && ds.images.length > 0 && (
          <section>
            <SectionHeading>Images ({ds.images.length})</SectionHeading>
            <div className="flex flex-col gap-1">
              {ds.images.map((img, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 rounded-sm px-4 py-2 font-mono text-xs text-zinc-300"
                >
                  {img}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Labels & Annotations */}
        {((ds.labels && Object.keys(ds.labels).length > 0) ||
          (ds.annotations && Object.keys(ds.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {ds.labels && Object.keys(ds.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={ds.labels} />
              </div>
            )}
            {ds.annotations && Object.keys(ds.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={ds.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Conditions */}
        {ds.conditions && ds.conditions.length > 0 && (
          <section>
            <SectionHeading>Conditions</SectionHeading>
            <ConditionsTable conditions={ds.conditions} />
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this daemonset."
          />
        </section>
      </div>
    </div>
  );
}
