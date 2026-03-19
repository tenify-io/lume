import { useEffect, useState } from "react";
import { GetNodeDetail, GetNodeEvents } from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

export function NodeDetailView({ name }: { name: string }) {
  const { goBack } = useNavigation();
  const [node, setNode] = useState<kube.NodeDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [nodeDetail, nodeEvents] = await Promise.all([
          GetNodeDetail(name),
          GetNodeEvents(name),
        ]);
        setNode(nodeDetail);
        setEvents(nodeEvents || []);
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
      "nodes:changed",
      (event: { type: string; data: { name: string } }) => {
        if (event.data.name !== name) return;

        if (event.type === "DELETED") {
          setError("This node has been removed");
          setNode(null);
          return;
        }

        Promise.all([GetNodeDetail(name), GetNodeEvents(name)])
          .then(([nodeDetail, nodeEvents]) => {
            setNode(nodeDetail);
            setEvents(nodeEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading node details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Nodes
        </Button>
      </div>
    );
  }

  if (!node) return null;

  const internalIP =
    node.addresses?.find((a) => a.type === "InternalIP")?.address || "—";
  const externalIP =
    node.addresses?.find((a) => a.type === "ExternalIP")?.address || "—";

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
  }

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Node overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-zinc-100 truncate">
              {node.name}
            </h2>
            <StatusBadge status={node.status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Roles", value: node.roles },
              { label: "Age", value: node.age },
              { label: "Version", value: node.systemInfo.kubeletVersion },
              { label: "Pod CIDR", value: node.podCIDR },
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
              <span className="text-zinc-500">Internal IP</span>
              <p className="text-zinc-200 font-mono text-xs">{internalIP}</p>
            </div>
            <div>
              <span className="text-zinc-500">External IP</span>
              <p className="text-zinc-200 font-mono text-xs">{externalIP}</p>
            </div>
            <div>
              <span className="text-zinc-500">OS</span>
              <p className="text-zinc-200">
                {node.systemInfo.operatingSystem} / {node.systemInfo.architecture}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">OS Image</span>
              <p className="text-zinc-200">{node.systemInfo.osImage || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Kernel</span>
              <p className="text-zinc-200">{node.systemInfo.kernelVersion || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Container Runtime</span>
              <p className="text-zinc-200">
                {node.systemInfo.containerRuntimeVersion || "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{node.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
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
                      className="px-3 py-1.5 text-left text-[11px] font-semibold text-zinc-600 bg-zinc-900"
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
                      {r.cap || "—"}
                    </td>
                    <td className="px-3 py-1.5 border-b border-zinc-800/30 font-mono text-zinc-300">
                      {r.alloc || "—"}
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
                        className="px-3 py-1.5 text-left text-[11px] font-semibold text-zinc-600 bg-zinc-900"
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
                        {t.value || "—"}
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
                          className="px-3 py-1.5 text-left text-[11px] font-semibold text-zinc-600 bg-zinc-900"
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
                            {img.sizeBytes ? formatBytes(img.sizeBytes) : "—"}
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
      </div>
    </div>
  );
}
