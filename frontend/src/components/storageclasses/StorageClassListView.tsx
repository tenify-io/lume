import { useState, useEffect } from "react";
import { GetStorageClasses } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";

export function StorageClassListView() {
  const { navigate } = useNavigation();
  const { setError } = useCluster();
  const [search, setSearch] = useState("");
  const [storageClasses, setStorageClasses] = useState<
    kube.StorageClassInfo[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    GetStorageClasses()
      .then((result) => {
        if (!cancelled) setStorageClasses(result || []);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setError]);

  const filteredSCs = storageClasses.filter(
    (sc) =>
      sc.name.toLowerCase().includes(search.toLowerCase()) ||
      sc.provisioner.toLowerCase().includes(search.toLowerCase()) ||
      sc.reclaimPolicy.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900 border-b border-zinc-800/50">
        <div className="ml-auto">
          <Input
            type="text"
            placeholder="Search storage classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredSCs.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No storage classes found.</p>
        </div>
      )}

      {/* StorageClass table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Name",
                "Provisioner",
                "Reclaim Policy",
                "Binding Mode",
                "Expansion",
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
            {filteredSCs.map((sc) => (
              <tr
                key={sc.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({
                    page: "storageclass-detail",
                    name: sc.name,
                  })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  <span>{sc.name}</span>
                  {sc.isDefault && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 rounded-sm">
                      default
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                  {sc.provisioner || "\u2014"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {sc.reclaimPolicy || "\u2014"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {sc.volumeBindingMode || "\u2014"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {sc.allowVolumeExpansion ? "Enabled" : "Disabled"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {sc.age}
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
          : `${filteredSCs.length} storage class(es)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
