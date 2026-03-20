import { useState } from "react";
import { GetServices, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
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

export function ServiceListView() {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");

  const { items: services, loading } = useResourceList<kube.ServiceInfo>({
    fetchItems: () => GetServices(selectedNamespace),
    eventChannel: "services:changed",
    getKey: (svc) => svc.namespace + "/" + svc.name,
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

  const filteredServices = services.filter(
    (svc) =>
      svc.name.toLowerCase().includes(search.toLowerCase()) ||
      svc.namespace.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No services found.</p>
        </div>
      )}

      {/* Service table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Name",
                "Namespace",
                "Type",
                "Cluster IP",
                "External IP",
                "Ports",
                "Age",
                "Selector",
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
            {filteredServices.map((svc) => (
              <tr
                key={svc.namespace + "/" + svc.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({
                    page: "service-detail",
                    namespace: svc.namespace,
                    name: svc.name,
                  })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {svc.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {svc.namespace}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <StatusBadge status={svc.type} />
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                  {svc.clusterIP || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs overflow-hidden text-ellipsis max-w-[200px]">
                  {svc.externalIP || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                  {svc.ports || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {svc.age}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]">
                  {svc.selector || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredServices.length} service(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
