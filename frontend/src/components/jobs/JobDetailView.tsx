import {
  GetJobDetail,
  GetJobEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";

export function JobDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  return (
    <ResourceDetailView<kube.JobDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetJobDetail(namespace, name)}
      fetchEvents={() => GetJobEvents(namespace, name)}
      eventChannel="jobs:changed"
      resourceLabel="job"
    >
      {(job, events) => (
        <>
          {/* Job overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {job.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">{job.namespace}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Completions", value: job.completions },
                { label: "Active", value: String(job.active) },
                { label: "Succeeded", value: String(job.succeeded) },
                { label: "Failed", value: String(job.failed) },
                { label: "Age", value: job.age },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-950 rounded-sm px-4 py-3">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    {s.label}
                  </div>
                  <div className="text-lg font-bold text-zinc-200 mt-0.5">
                    {s.value || "\u2014"}
                  </div>
                </div>
              ))}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13px]">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Duration</span>
                <p className="text-zinc-200">{job.duration || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Parallelism</span>
                <p className="text-zinc-200">
                  {job.parallelism != null ? String(job.parallelism) : "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Backoff Limit</span>
                <p className="text-zinc-200">
                  {job.backoffLimit != null ? String(job.backoffLimit) : "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Completion Mode</span>
                <p className="text-zinc-200">{job.completionMode || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Suspend</span>
                <p className="text-zinc-200">{job.suspend ? "Yes" : "No"}</p>
              </div>
              {job.owner && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Owner (CronJob)</span>
                  <p className="text-zinc-200">{job.owner}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                <p className="text-zinc-200">{job.creationTimestamp || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
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
        </>
      )}
    </ResourceDetailView>
  );
}
