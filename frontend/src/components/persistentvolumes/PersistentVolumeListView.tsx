import { useState } from "react";
import { GetPersistentVolumes } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useNavigation } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";
import { useResourceList } from "@/hooks/useResourceList";

export function PersistentVolumeListView() {
  const { navigate } = useNavigation();
  const { setError } = useCluster();
  const [search, setSearch] = useState("");

  const { items: pvs, loading } = useResourceList<kube.PersistentVolumeInfo>({
    fetchItems: () => GetPersistentVolumes(),
    eventChannel: "persistentvolumes:changed",
    getKey: (pv) => pv.name,
    sortItems: (a, b) => a.name.localeCompare(b.name),
    onError: setError,
  });

  const filteredPVs = pvs.filter(
    (pv) =>
      pv.name.toLowerCase().includes(search.toLowerCase()) ||
      pv.status.toLowerCase().includes(search.toLowerCase()) ||
      pv.storageClass.toLowerCase().includes(search.toLowerCase()) ||
      pv.claim.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900 border-b border-zinc-800/50">
        <div className="ml-auto">
          <Input
            type="text"
            placeholder="Search persistent volumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredPVs.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No persistent volumes found.</p>
        </div>
      )}

      {/* PV table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Name",
                "Capacity",
                "Access Modes",
                "Reclaim Policy",
                "Status",
                "Claim",
                "Storage Class",
                "Age",
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
            {filteredPVs.map((pv) => (
              <tr
                key={pv.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({
                    page: "persistentvolume-detail",
                    name: pv.name,
                  })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {pv.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                  {pv.capacity || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                  {pv.accessModes || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {pv.reclaimPolicy || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <StatusBadge status={pv.status} />
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs overflow-hidden text-ellipsis max-w-[250px]">
                  {pv.claim || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {pv.storageClass || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {pv.age}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading
          ? "Loading..."
          : `${filteredPVs.length} persistent volume(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
