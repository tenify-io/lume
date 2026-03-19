import { useState } from "react";
import { GetDeployments, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useNavigation } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";
import { useResourceList } from "@/hooks/useResourceList";

function deploymentStatus(dep: kube.DeploymentInfo): string {
  const parts = dep.ready.split("/");
  const ready = parseInt(parts[0], 10);
  const desired = parseInt(parts[1], 10);
  if (desired === 0) return "Scaled Down";
  if (ready === desired && dep.available === desired) return "Available";
  if (ready < desired) return "Progressing";
  return "Available";
}

export function DeploymentListView() {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");

  const { items: deployments, loading } = useResourceList<kube.DeploymentInfo>({
    fetchItems: () => GetDeployments(selectedNamespace),
    eventChannel: "deployments:changed",
    getKey: (dep) => dep.namespace + "/" + dep.name,
    sortItems: (a, b) => {
      if (a.namespace !== b.namespace)
        return a.namespace.localeCompare(b.namespace);
      return a.name.localeCompare(b.name);
    },
    startWatch: () => WatchPods(selectedNamespace),
    stopWatch: () => UnwatchAll(),
    onError: setError,
    deps: [selectedNamespace],
  });

  const filteredDeployments = deployments.filter(
    (dep) =>
      dep.name.toLowerCase().includes(search.toLowerCase()) ||
      dep.namespace.toLowerCase().includes(search.toLowerCase()),
  );

  function onNamespaceChange(ns: string | null) {
    setSelectedNamespace(!ns || ns === "__all__" ? "" : ns);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Namespace:
          </label>
          <Select
            value={selectedNamespace || "__all__"}
            onValueChange={onNamespaceChange}
          >
            <SelectTrigger className="min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Namespaces</SelectItem>
              {namespaces.map((ns) => (
                <SelectItem key={ns} value={ns}>
                  {ns}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <Input
            type="text"
            placeholder="Search deployments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredDeployments.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No deployments found.</p>
        </div>
      )}

      {/* Deployment table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Name",
                "Namespace",
                "Status",
                "Ready",
                "Up-to-Date",
                "Available",
                "Age",
                "Images",
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
            {filteredDeployments.map((dep) => (
              <tr
                key={dep.namespace + "/" + dep.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({
                    page: "deployment-detail",
                    namespace: dep.namespace,
                    name: dep.name,
                  })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {dep.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {dep.namespace}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <StatusBadge status={deploymentStatus(dep)} />
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {dep.ready}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {dep.upToDate}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {dep.available}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {dep.age}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]">
                  {dep.images?.join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredDeployments.length} deployment(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
