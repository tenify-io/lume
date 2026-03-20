import { useState } from "react";
import { GetPodDetail, GetPodEvents } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MetadataRow } from "@/components/shared/MetadataRow";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy, ScrollText, Terminal } from "lucide-react";

function containerStateClass(state: string): string {
  if (state === "running") return "text-emerald-400";
  if (["CrashLoopBackOff", "Error", "OOMKilled", "Completed"].includes(state))
    return "text-red-400";
  return "text-amber-400";
}

function ContainerList({
  containers,
  expandedContainers,
  onToggle,
  hasResources,
}: {
  containers: kube.ContainerDetail[];
  expandedContainers: Set<string>;
  onToggle: (name: string) => void;
  hasResources: (r: kube.ContainerResource) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {containers.map((c) => {
        const expanded = expandedContainers.has(c.name);
        return (
          <div key={c.name} className="bg-zinc-900 rounded-sm">
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-900 transition-colors"
              onClick={() => onToggle(c.name)}
            >
              <span className="text-[10px] text-zinc-600">
                {expanded ? "\u25BC" : "\u25B6"}
              </span>
              <span className="font-semibold text-[13px] text-zinc-200">
                {c.name}
              </span>
              <span
                className={`text-[11px] font-semibold ${containerStateClass(c.state)}`}
              >
                {c.state}
              </span>
              <span className="ml-auto text-xs text-zinc-500 font-mono truncate max-w-[300px]">
                {c.image}
              </span>
            </button>
            {expanded && (
              <div className="px-4 pb-3 pt-1 flex flex-col gap-3 text-[13px]">
                <MetadataRow
                  label="Image"
                  value={
                    <span className="font-mono text-xs">{c.image}</span>
                  }
                />
                <MetadataRow
                  label="Ready"
                  value={c.ready ? "Yes" : "No"}
                />
                <MetadataRow
                  label="State"
                  value={
                    <span className={containerStateClass(c.state)}>
                      {c.state}
                      {c.stateDetail && (
                        <span className="text-zinc-500 ml-2">
                          — {c.stateDetail}
                        </span>
                      )}
                    </span>
                  }
                />
                <MetadataRow
                  label="Restart Count"
                  value={String(c.restartCount)}
                />

                {c.ports && c.ports.length > 0 && (
                  <div>
                    <div className="text-zinc-500 mb-1">Ports</div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.ports.map((p, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-zinc-800 rounded text-[11px] font-mono text-zinc-300"
                        >
                          {p.containerPort}/{p.protocol}
                          {p.name && ` (${p.name})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasResources(c.resources) && (
                  <div>
                    <div className="text-zinc-500 mb-1">Resources</div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {c.resources.cpuRequest && (
                        <div>
                          <span className="text-zinc-500">CPU Request: </span>
                          <span className="font-mono">
                            {c.resources.cpuRequest}
                          </span>
                        </div>
                      )}
                      {c.resources.cpuLimit && (
                        <div>
                          <span className="text-zinc-500">CPU Limit: </span>
                          <span className="font-mono">
                            {c.resources.cpuLimit}
                          </span>
                        </div>
                      )}
                      {c.resources.memoryRequest && (
                        <div>
                          <span className="text-zinc-500">
                            Memory Request:{" "}
                          </span>
                          <span className="font-mono">
                            {c.resources.memoryRequest}
                          </span>
                        </div>
                      )}
                      {c.resources.memoryLimit && (
                        <div>
                          <span className="text-zinc-500">
                            Memory Limit:{" "}
                          </span>
                          <span className="font-mono">
                            {c.resources.memoryLimit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {c.volumeMounts && c.volumeMounts.length > 0 && (
                  <div>
                    <div className="text-zinc-500 mb-1">Volume Mounts</div>
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          {["Name", "Mount Path", "Read Only"].map((h) => (
                            <th
                              key={h}
                              className="px-2 py-1 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {c.volumeMounts.map((vm, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1 border-b border-zinc-800 font-mono">
                              {vm.name}
                            </td>
                            <td className="px-2 py-1 border-b border-zinc-800 font-mono">
                              {vm.mountPath}
                            </td>
                            <td className="px-2 py-1 border-b border-zinc-800">
                              {vm.readOnly ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PodDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(
    new Set(),
  );

  function toggleContainer(containerName: string) {
    setExpandedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(containerName)) {
        next.delete(containerName);
      } else {
        next.add(containerName);
      }
      return next;
    });
  }

  const hasResources = (r: kube.ContainerResource) =>
    r.cpuRequest || r.cpuLimit || r.memoryRequest || r.memoryLimit;

  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "logs", label: "View Logs", icon: ScrollText, onClick: () => {}, group: "primary" },
    { id: "exec", label: "Exec", icon: Terminal, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive", group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.PodDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetPodDetail(namespace, name)}
      fetchEvents={() => GetPodEvents(namespace, name)}
      eventChannel="pods:changed"
      resourceLabel="pod"
      toolbar={<ResourceToolbar actions={actions} />}
    >
      {(pod, events) => (
        <>
          {/* Pod overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {pod.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {pod.namespace}
                </p>
              </div>
              <StatusBadge status={pod.status} />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Ready", value: pod.ready },
                { label: "Restarts", value: String(pod.restarts) },
                { label: "Age", value: pod.age },
                { label: "QoS", value: pod.qosClass },
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
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Node</span>
                <p className="text-zinc-200 truncate">{pod.nodeName || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Service Account</span>
                <p className="text-zinc-200 truncate">
                  {pod.serviceAccountName || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Pod IP</span>
                <p className="text-zinc-200 font-mono text-xs">
                  {pod.ip || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Host IP</span>
                <p className="text-zinc-200 font-mono text-xs">
                  {pod.hostIP || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Restart Policy</span>
                <p className="text-zinc-200">{pod.restartPolicy || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Start Time</span>
                <p className="text-zinc-200">{pod.startTime || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                <p className="text-zinc-200">{pod.creationTimestamp || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                <p className="text-zinc-200 font-mono text-xs truncate">
                  {pod.uid}
                </p>
              </div>
            </div>
          </section>

          {/* Labels & Annotations */}
          {((pod.labels && Object.keys(pod.labels).length > 0) ||
            (pod.annotations && Object.keys(pod.annotations).length > 0)) && (
            <section className="flex flex-col gap-4">
              {pod.labels && Object.keys(pod.labels).length > 0 && (
                <div>
                  <SectionHeading>Labels</SectionHeading>
                  <KeyValueList entries={pod.labels} />
                </div>
              )}
              {pod.annotations && Object.keys(pod.annotations).length > 0 && (
                <div>
                  <SectionHeading>Annotations</SectionHeading>
                  <KeyValueList entries={pod.annotations} />
                </div>
              )}
            </section>
          )}

          {/* Conditions */}
          {pod.conditions && pod.conditions.length > 0 && (
            <section>
              <SectionHeading>Conditions</SectionHeading>
              <ConditionsTable conditions={pod.conditions} />
            </section>
          )}

          {/* Init Containers */}
          {pod.initContainers && pod.initContainers.length > 0 && (
            <section>
              <SectionHeading>
                Init Containers ({pod.initContainers.length})
              </SectionHeading>
              <ContainerList
                containers={pod.initContainers}
                expandedContainers={expandedContainers}
                onToggle={toggleContainer}
                hasResources={hasResources}
              />
            </section>
          )}

          {/* Containers */}
          <section>
            <SectionHeading>
              Containers ({pod.containers?.length || 0})
            </SectionHeading>
            <ContainerList
              containers={pod.containers || []}
              expandedContainers={expandedContainers}
              onToggle={toggleContainer}
              hasResources={hasResources}
            />
          </section>

          {/* Volumes */}
          {pod.volumes && pod.volumes.length > 0 && (
            <section>
              <SectionHeading>Volumes ({pod.volumes.length})</SectionHeading>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {["Name", "Type", "Source"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pod.volumes.map((v) => (
                      <tr key={v.name}>
                        <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-200">
                          {v.name}
                        </td>
                        <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400">
                          {v.type}
                        </td>
                        <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-400">
                          {v.source || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Events */}
          <section>
            <SectionHeading>Events ({events.length})</SectionHeading>
            <EventsTable
              events={events}
              emptyMessage="No events found for this pod."
            />
          </section>
        </>
      )}
    </ResourceDetailView>
  );
}
