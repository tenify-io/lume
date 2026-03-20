import { useEffect, useState } from "react";
import {
  GetPersistentVolumeDetail,
  GetPersistentVolumeEvents,
} from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

export function PersistentVolumeDetailView({ name }: { name: string }) {
  const { goBack } = useNavigation();
  const [pv, setPV] = useState<kube.PersistentVolumeDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [pvDetail, pvEvents] = await Promise.all([
          GetPersistentVolumeDetail(name),
          GetPersistentVolumeEvents(name),
        ]);
        setPV(pvDetail);
        setEvents(pvEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  // Live updates
  useEffect(() => {
    const cancel = EventsOn(
      "persistentvolumes:changed",
      (event: { type: string; data: { name: string } }) => {
        if (event.data.name !== name) return;

        if (event.type === "DELETED") {
          setError("This persistent volume has been deleted");
          setPV(null);
          return;
        }

        Promise.all([
          GetPersistentVolumeDetail(name),
          GetPersistentVolumeEvents(name),
        ])
          .then(([pvDetail, pvEvents]) => {
            setPV(pvDetail);
            setEvents(pvEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading persistent volume details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to PersistentVolumes
        </Button>
      </div>
    );
  }

  if (!pv) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* PV overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-zinc-100 truncate">
              {pv.name}
            </h2>
            <StatusBadge status={pv.status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Capacity", value: pv.capacity },
              { label: "Access Modes", value: pv.accessModes },
              { label: "Reclaim Policy", value: pv.reclaimPolicy },
              { label: "Age", value: pv.age },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-950 rounded-sm px-3 py-2">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                  {s.value || "\u2014"}
                </div>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <div>
              <span className="text-zinc-500">Storage Class</span>
              <p className="text-zinc-200">{pv.storageClass || "\u2014"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Volume Mode</span>
              <p className="text-zinc-200">{pv.volumeMode || "\u2014"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Claim</span>
              <p className="text-zinc-200 font-mono text-xs">
                {pv.claim || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Source</span>
              <p className="text-zinc-200">{pv.source || "\u2014"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">
                {pv.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {pv.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Mount Options */}
        {pv.mountOptions && pv.mountOptions.length > 0 && (
          <section>
            <SectionHeading>
              Mount Options ({pv.mountOptions.length})
            </SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {pv.mountOptions.map((opt) => (
                <span
                  key={opt}
                  className="bg-zinc-900 px-2 py-0.5 text-xs font-mono text-zinc-300 rounded-sm"
                >
                  {opt}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Labels & Annotations */}
        {((pv.labels && Object.keys(pv.labels).length > 0) ||
          (pv.annotations && Object.keys(pv.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {pv.labels && Object.keys(pv.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={pv.labels} />
              </div>
            )}
            {pv.annotations && Object.keys(pv.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={pv.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this persistent volume."
          />
        </section>
      </div>
    </div>
  );
}
