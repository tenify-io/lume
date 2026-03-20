import {
  GetDeploymentDetail,
  GetDeploymentEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy, Scaling, RotateCcw } from "lucide-react";

function deploymentStatus(dep: kube.DeploymentDetail): string {
  const parts = dep.ready.split("/");
  const ready = parseInt(parts[0], 10);
  const desired = parseInt(parts[1], 10);
  if (desired === 0) return "Scaled Down";
  if (ready === desired && dep.available === desired) return "Available";
  if (ready < desired) return "Progressing";
  return "Available";
}

export function DeploymentDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "scale", label: "Scale", icon: Scaling, onClick: () => {}, group: "primary" },
    { id: "restart", label: "Restart", icon: RotateCcw, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive", group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.DeploymentDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetDeploymentDetail(namespace, name)}
      fetchEvents={() => GetDeploymentEvents(namespace, name)}
      eventChannel="deployments:changed"
      resourceLabel="deployment"
      toolbar={<ResourceToolbar actions={actions} />}
    >
      {(dep, events) => {
        const status = deploymentStatus(dep);
        return (
          <>
            {/* Deployment overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              {/* Identity */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                    {dep.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{dep.namespace}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Ready", value: dep.ready },
                  { label: "Up-to-Date", value: String(dep.upToDate) },
                  { label: "Available", value: String(dep.available) },
                  { label: "Age", value: dep.age },
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
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Strategy</span>
                  <p className="text-zinc-200">{dep.strategy || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Min Ready Seconds</span>
                  <p className="text-zinc-200">{dep.minReadySeconds}</p>
                </div>
                {dep.strategy === "RollingUpdate" && (
                  <>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-medium">Max Surge</span>
                      <p className="text-zinc-200">{dep.maxSurge || "\u2014"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-medium">Max Unavailable</span>
                      <p className="text-zinc-200">{dep.maxUnavailable || "\u2014"}</p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Revision History Limit</span>
                  <p className="text-zinc-200">
                    {dep.revisionHistoryLimit != null
                      ? String(dep.revisionHistoryLimit)
                      : "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                  <p className="text-zinc-200">{dep.creationTimestamp || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                  <p className="text-zinc-200 font-mono text-xs truncate">
                    {dep.uid}
                  </p>
                </div>
              </div>
            </section>

            {/* Selector */}
            {dep.selector && Object.keys(dep.selector).length > 0 && (
              <section>
                <SectionHeading>Selector</SectionHeading>
                <KeyValueList entries={dep.selector} />
              </section>
            )}

            {/* Images */}
            {dep.images && dep.images.length > 0 && (
              <section>
                <SectionHeading>Images ({dep.images.length})</SectionHeading>
                <div className="flex flex-col gap-1">
                  {dep.images.map((img, i) => (
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
            {((dep.labels && Object.keys(dep.labels).length > 0) ||
              (dep.annotations && Object.keys(dep.annotations).length > 0)) && (
              <section className="flex flex-col gap-4">
                {dep.labels && Object.keys(dep.labels).length > 0 && (
                  <div>
                    <SectionHeading>Labels</SectionHeading>
                    <KeyValueList entries={dep.labels} />
                  </div>
                )}
                {dep.annotations && Object.keys(dep.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={dep.annotations} />
                  </div>
                )}
              </section>
            )}

            {/* Conditions */}
            {dep.conditions && dep.conditions.length > 0 && (
              <section>
                <SectionHeading>Conditions</SectionHeading>
                <ConditionsTable conditions={dep.conditions} />
              </section>
            )}

            {/* Events */}
            <section>
              <SectionHeading>Events ({events.length})</SectionHeading>
              <EventsTable
                events={events}
                emptyMessage="No events found for this deployment."
              />
            </section>
          </>
        );
      }}
    </ResourceDetailView>
  );
}
