import { useState } from "react";
import { GetNodeDetail, GetNodeEvents } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
}

export function NodeDetailView({ name }: { name: string }) {
  const [showImages, setShowImages] = useState(false);

  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const, group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.NodeDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      name={name}
      fetchDetail={() => GetNodeDetail(name)}
      fetchEvents={() => GetNodeEvents(name)}
      eventChannel="nodes:changed"
      resourceLabel="node"
    >
      {(node, events) => {
        const internalIP =
          node.addresses?.find((a) => a.type === "InternalIP")?.address || "\u2014";
        const externalIP =
          node.addresses?.find((a) => a.type === "ExternalIP")?.address || "\u2014";

        return (
          <>
            {/* Node overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {node.name}
                </h2>
                <StatusBadge status={node.status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Roles", value: node.roles },
                  { label: "Age", value: node.age },
                  { label: "Version", value: node.systemInfo.kubeletVersion },
                  { label: "Pod CIDR", value: node.podCIDR },
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
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Internal IP</span>
                  <p className="text-zinc-200 font-mono text-xs">{internalIP}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">External IP</span>
                  <p className="text-zinc-200 font-mono text-xs">{externalIP}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">OS</span>
                  <p className="text-zinc-200">
                    {node.systemInfo.operatingSystem} / {node.systemInfo.architecture}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">OS Image</span>
                  <p className="text-zinc-200">{node.systemInfo.osImage || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Kernel</span>
                  <p className="text-zinc-200">{node.systemInfo.kernelVersion || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Container Runtime</span>
                  <p className="text-zinc-200">
                    {node.systemInfo.containerRuntimeVersion || "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                  <p className="text-zinc-200">{node.creationTimestamp || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                  <p className="text-zinc-200 font-mono text-xs truncate">
                    {node.uid}
                  </p>
                </div>
              </div>
            </section>

            {/* Capacity vs Allocatable */}
            <section>
              <SectionHeading>Resources</SectionHeading>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {["Resource", "Capacity", "Allocatable"].map((h) => (
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
                    {[
                      { label: "CPU", cap: node.capacity.cpu, alloc: node.allocatable.cpu },
                      { label: "Memory", cap: node.capacity.memory, alloc: node.allocatable.memory },
                      { label: "Pods", cap: node.capacity.pods, alloc: node.allocatable.pods },
                      { label: "Ephemeral Storage", cap: node.capacity.ephemeralStorage, alloc: node.allocatable.ephemeralStorage },
                    ].map((r) => (
                      <tr key={r.label}>
                        <td className="px-3 py-1.5 border-b border-zinc-800/30 font-medium">
                          {r.label}
                        </td>
                        <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-300">
                          {r.cap || "\u2014"}
                        </td>
                        <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-300">
                          {r.alloc || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Labels & Annotations */}
            {((node.labels && Object.keys(node.labels).length > 0) ||
              (node.annotations && Object.keys(node.annotations).length > 0)) && (
              <section className="flex flex-col gap-4">
                {node.labels && Object.keys(node.labels).length > 0 && (
                  <div>
                    <SectionHeading>Labels</SectionHeading>
                    <KeyValueList entries={node.labels} />
                  </div>
                )}
                {node.annotations && Object.keys(node.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={node.annotations} />
                  </div>
                )}
              </section>
            )}

            {/* Conditions */}
            {node.conditions && node.conditions.length > 0 && (
              <section>
                <SectionHeading>Conditions</SectionHeading>
                <ConditionsTable conditions={node.conditions} />
              </section>
            )}

            {/* Taints */}
            {node.taints && node.taints.length > 0 && (
              <section>
                <SectionHeading>Taints ({node.taints.length})</SectionHeading>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        {["Key", "Value", "Effect"].map((h) => (
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
                      {node.taints.map((t, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-200">
                            {t.key}
                          </td>
                          <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-400">
                            {t.value || "\u2014"}
                          </td>
                          <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400">
                            {t.effect}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Images */}
            {node.images && node.images.length > 0 && (
              <section>
                <SectionHeading>
                  <button
                    className="flex items-center gap-1.5"
                    onClick={() => setShowImages(!showImages)}
                  >
                    <span className="text-[10px] text-zinc-600">
                      {showImages ? "\u25BC" : "\u25B6"}
                    </span>
                    Images ({node.images.length})
                  </button>
                </SectionHeading>
                {showImages && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          {["Image", "Size"].map((h) => (
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
                        {node.images.map((img, i) => {
                          const displayName =
                            img.names?.find((n) => !n.includes("sha256:")) ||
                            img.names?.[0] ||
                            "unknown";
                          return (
                            <tr key={i}>
                              <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-xs text-zinc-300 break-all">
                                {displayName}
                              </td>
                              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400 whitespace-nowrap">
                                {img.sizeBytes ? formatBytes(img.sizeBytes) : "\u2014"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* Events */}
            <section>
              <SectionHeading>Events ({events.length})</SectionHeading>
              <EventsTable
                events={events}
                emptyMessage="No events found for this node."
              />
            </section>
          </>
        );
      }}
    </ResourceDetailView>
  );
}
