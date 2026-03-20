import {
  GetDaemonSetDetail,
  GetDaemonSetEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy, RotateCcw } from "lucide-react";

function daemonSetStatus(ds: kube.DaemonSetDetail): string {
  if (ds.desired === 0) return "Scaled Down";
  if (ds.ready === ds.desired) return "Ready";
  if (ds.ready < ds.desired) return "Progressing";
  return "Ready";
}

export function DaemonSetDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "restart", label: "Restart", icon: RotateCcw, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive", group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.DaemonSetDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetDaemonSetDetail(namespace, name)}
      fetchEvents={() => GetDaemonSetEvents(namespace, name)}
      eventChannel="daemonsets:changed"
      resourceLabel="daemonset"
      toolbar={<ResourceToolbar actions={actions} />}
    >
      {(ds, events) => {
        const status = daemonSetStatus(ds);
        return (
          <>
            {/* DaemonSet overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              {/* Identity */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                    {ds.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{ds.namespace}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Desired", value: String(ds.desired) },
                  { label: "Current", value: String(ds.current) },
                  { label: "Ready", value: String(ds.ready) },
                  { label: "Up-to-Date", value: String(ds.upToDate) },
                  { label: "Age", value: ds.age },
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
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Update Strategy</span>
                  <p className="text-zinc-200">{ds.updateStrategy || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Min Ready Seconds</span>
                  <p className="text-zinc-200">{ds.minReadySeconds}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Revision History Limit</span>
                  <p className="text-zinc-200">
                    {ds.revisionHistoryLimit != null
                      ? String(ds.revisionHistoryLimit)
                      : "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Available</span>
                  <p className="text-zinc-200">{ds.available}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                  <p className="text-zinc-200">{ds.creationTimestamp || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
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
          </>
        );
      }}
    </ResourceDetailView>
  );
}
