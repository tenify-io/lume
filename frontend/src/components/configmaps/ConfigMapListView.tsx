import { useState } from "react";
import { GetConfigMaps, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";
import { useResourceList } from "@/hooks/useResourceList";

export function ConfigMapListView() {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");

  const { items: configmaps, loading } = useResourceList<kube.ConfigMapInfo>({
    fetchItems: () => GetConfigMaps(selectedNamespace),
    eventChannel: "configmaps:changed",
    getKey: (cm) => cm.namespace + "/" + cm.name,
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

  const filteredConfigMaps = configmaps.filter(
    (cm) =>
      cm.name.toLowerCase().includes(search.toLowerCase()) ||
      cm.namespace.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search config maps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredConfigMaps.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No config maps found.</p>
        </div>
      )}

      {/* ConfigMap table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {["Name", "Namespace", "Data", "Age"].map((h) => (
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
            {filteredConfigMaps.map((cm) => (
              <tr
                key={cm.namespace + "/" + cm.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({
                    page: "configmap-detail",
                    namespace: cm.namespace,
                    name: cm.name,
                  })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {cm.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {cm.namespace}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {cm.dataCount}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {cm.age}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredConfigMaps.length} config map(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
