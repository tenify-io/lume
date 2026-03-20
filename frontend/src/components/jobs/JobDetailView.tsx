import { useEffect, useState } from "react";
import {
  GetJobDetail,
  GetJobEvents,
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

interface JobDetailViewProps {
  namespace: string;
  name: string;
}

export function JobDetailView({
  namespace,
  name,
}: JobDetailViewProps) {
  const { goBack } = useNavigation();
  const [job, setJob] = useState<kube.JobDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [jobDetail, jobEvents] = await Promise.all([
          GetJobDetail(namespace, name),
          GetJobEvents(namespace, name),
        ]);
        setJob(jobDetail);
        setEvents(jobEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates
  useEffect(() => {
    const cancel = EventsOn(
      "jobs:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This job has been deleted");
          setJob(null);
          return;
        }

        Promise.all([
          GetJobDetail(namespace, name),
          GetJobEvents(namespace, name),
        ])
          .then(([jobDetail, jobEvents]) => {
            setJob(jobDetail);
            setEvents(jobEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Job overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {job.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{job.namespace}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Completions", value: job.completions },
              { label: "Active", value: String(job.active) },
              { label: "Succeeded", value: String(job.succeeded) },
              { label: "Failed", value: String(job.failed) },
              { label: "Age", value: job.age },
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
              <span className="text-zinc-500">Duration</span>
              <p className="text-zinc-200">{job.duration || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Parallelism</span>
              <p className="text-zinc-200">
                {job.parallelism != null ? String(job.parallelism) : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Backoff Limit</span>
              <p className="text-zinc-200">
                {job.backoffLimit != null ? String(job.backoffLimit) : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Completion Mode</span>
              <p className="text-zinc-200">{job.completionMode || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Suspend</span>
              <p className="text-zinc-200">{job.suspend ? "Yes" : "No"}</p>
            </div>
            {job.owner && (
              <div>
                <span className="text-zinc-500">Owner (CronJob)</span>
                <p className="text-zinc-200">{job.owner}</p>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{job.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {job.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Images */}
        {job.images && job.images.length > 0 && (
          <section>
            <SectionHeading>Images ({job.images.length})</SectionHeading>
            <div className="flex flex-col gap-1">
              {job.images.map((img, i) => (
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
        {((job.labels && Object.keys(job.labels).length > 0) ||
          (job.annotations && Object.keys(job.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {job.labels && Object.keys(job.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={job.labels} />
              </div>
            )}
            {job.annotations && Object.keys(job.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={job.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Conditions */}
        {job.conditions && job.conditions.length > 0 && (
          <section>
            <SectionHeading>Conditions</SectionHeading>
            <ConditionsTable conditions={job.conditions} />
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this job."
          />
        </section>
      </div>
    </div>
  );
}
