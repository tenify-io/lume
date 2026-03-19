import { useState } from "react";
import { GetNodes } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useNavigation } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";
import { useResourceList } from "@/hooks/useResourceList";

export function NodeListView() {
  const { navigate } = useNavigation();
  const { setError } = useCluster();
  const [search, setSearch] = useState("");

  const { items: nodes, loading } = useResourceList<kube.NodeInfo>({
    fetchItems: () => GetNodes(),
    eventChannel: "nodes:changed",
    getKey: (node) => node.name,
    sortItems: (a, b) => a.name.localeCompare(b.name),
    onError: setError,
  });

  const filteredNodes = nodes.filter(
    (node) =>
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.status.toLowerCase().includes(search.toLowerCase()) ||
      node.roles.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900">
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Live
        </span>

        <div className="ml-auto">
          <Input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredNodes.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No nodes found.</p>
        </div>
      )}

      {/* Node table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Name",
                "Status",
                "Roles",
                "Age",
                "Version",
                "Internal IP",
                "OS Image",
                "Runtime",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredNodes.map((node) => (
              <tr
                key={node.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900"
                onClick={() =>
                  navigate({ page: "node-detail", name: node.name })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-900 font-semibold text-zinc-200 whitespace-nowrap">
                  {node.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                  <StatusBadge status={node.status} />
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                  {node.roles}
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                  {node.age}
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                  {node.kubeletVersion}
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap font-mono text-xs">
                  {node.internalIP}
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                  {node.osImage}
                </td>
                <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap text-xs">
                  {node.containerRuntime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-zinc-900 shrink-0">
        {loading ? "Loading..." : `${filteredNodes.length} node(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
