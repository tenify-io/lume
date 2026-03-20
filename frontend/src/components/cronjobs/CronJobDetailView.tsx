import { useEffect, useState } from "react";
import {
  GetCronJobDetail,
  GetCronJobEvents,
} from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

interface CronJobDetailViewProps {
  namespace: string;
  name: string;
}

function cronJobStatus(cj: kube.CronJobDetail): string {
  if (cj.active > 0) return "Active";
  if (cj.suspend) return "Suspended";
  return "Idle";
}

export function CronJobDetailView({
  namespace,
  name,
}: CronJobDetailViewProps) {
  const { goBack } = useNavigation();
  const [cj, setCj] = useState<kube.CronJobDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [cjDetail, cjEvents] = await Promise.all([
          GetCronJobDetail(namespace, name),
          GetCronJobEvents(namespace, name),
        ]);
        setCj(cjDetail);
        setEvents(cjEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates — refetch detail when this cronjob changes
  useEffect(() => {
    const cancel = EventsOn(
      "cronjobs:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This cronjob has been deleted");
          setCj(null);
          return;
        }

        Promise.all([
          GetCronJobDetail(namespace, name),
          GetCronJobEvents(namespace, name),
        ])
          .then(([cjDetail, cjEvents]) => {
            setCj(cjDetail);
            setEvents(cjEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading cronjob details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to CronJobs
        </Button>
      </div>
    );
  }

  if (!cj) return null;

  const status = cronJobStatus(cj);

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* CronJob overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {cj.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{cj.namespace}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Schedule", value: cj.schedule },
              { label: "Suspend", value: cj.suspend ? "Yes" : "No" },
              { label: "Active", value: String(cj.active) },
              { label: "Last Schedule", value: cj.lastSchedule },
              { label: "Age", value: cj.age },
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
              <span className="text-zinc-500">Concurrency Policy</span>
              <p className="text-zinc-200">{cj.concurrencyPolicy || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Successful Jobs History Limit</span>
              <p className="text-zinc-200">
                {cj.successfulJobsHistoryLimit != null
                  ? String(cj.successfulJobsHistoryLimit)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Failed Jobs History Limit</span>
              <p className="text-zinc-200">
                {cj.failedJobsHistoryLimit != null
                  ? String(cj.failedJobsHistoryLimit)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Starting Deadline Seconds</span>
              <p className="text-zinc-200">
                {cj.startingDeadlineSeconds != null
                  ? String(cj.startingDeadlineSeconds)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{cj.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {cj.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Images */}
        {cj.images && cj.images.length > 0 && (
          <section>
            <SectionHeading>Images ({cj.images.length})</SectionHeading>
            <div className="flex flex-col gap-1">
              {cj.images.map((img, i) => (
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
        {((cj.labels && Object.keys(cj.labels).length > 0) ||
          (cj.annotations && Object.keys(cj.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {cj.labels && Object.keys(cj.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={cj.labels} />
              </div>
            )}
            {cj.annotations && Object.keys(cj.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={cj.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this cronjob."
          />
        </section>
      </div>
    </div>
  );
}
