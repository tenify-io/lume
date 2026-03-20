import {
  GetCronJobDetail,
  GetCronJobEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

function cronJobStatus(cj: kube.CronJobDetail): string {
  if (cj.active > 0) return "Active";
  if (cj.suspend) return "Suspended";
  return "Idle";
}

export function CronJobDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const, group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.CronJobDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      namespace={namespace}
      name={name}
      fetchDetail={() => GetCronJobDetail(namespace, name)}
      fetchEvents={() => GetCronJobEvents(namespace, name)}
      eventChannel="cronjobs:changed"
      resourceLabel="cronjob"
    >
      {(cj, events) => {
        const status = cronJobStatus(cj);
        return (
          <>
            {/* CronJob overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              {/* Identity */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                    {cj.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{cj.namespace}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Schedule", value: cj.schedule },
                  { label: "Suspend", value: cj.suspend ? "Yes" : "No" },
                  { label: "Active", value: String(cj.active) },
                  { label: "Last Schedule", value: cj.lastSchedule },
                  { label: "Age", value: cj.age },
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
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Concurrency Policy</span>
                  <p className="text-zinc-200">{cj.concurrencyPolicy || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Successful Jobs History Limit</span>
                  <p className="text-zinc-200">
                    {cj.successfulJobsHistoryLimit != null
                      ? String(cj.successfulJobsHistoryLimit)
                      : "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Failed Jobs History Limit</span>
                  <p className="text-zinc-200">
                    {cj.failedJobsHistoryLimit != null
                      ? String(cj.failedJobsHistoryLimit)
                      : "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Starting Deadline Seconds</span>
                  <p className="text-zinc-200">
                    {cj.startingDeadlineSeconds != null
                      ? String(cj.startingDeadlineSeconds)
                      : "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                  <p className="text-zinc-200">{cj.creationTimestamp || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
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
          </>
        );
      }}
    </ResourceDetailView>
  );
}
