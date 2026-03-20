import { useState, useEffect, useCallback } from "react";
import { GetNamespaceList } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useNavigation } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";

export function NamespaceListView() {
  const { navigate } = useNavigation();
  const { setError } = useCluster();
  const [search, setSearch] = useState("");
  const [namespaces, setNamespaces] = useState<kube.NamespaceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNamespaces = useCallback(async () => {
    try {
      const result = await GetNamespaceList();
      setNamespaces(result || []);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  const filteredNamespaces = namespaces.filter(
    (ns) =>
      ns.name.toLowerCase().includes(search.toLowerCase()) ||
      ns.status.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900 border-b border-zinc-800/50">
        <div className="ml-auto">
          <Input
            type="text"
            placeholder="Search namespaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredNamespaces.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No namespaces found.</p>
        </div>
      )}

      {/* Namespace table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {["Name", "Status", "Age"].map((h) => (
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
            {filteredNamespaces.map((ns) => (
              <tr
                key={ns.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({ page: "namespace-detail", name: ns.name })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap">
                  {ns.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <StatusBadge status={ns.status} />
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {ns.age}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredNamespaces.length} namespace(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
