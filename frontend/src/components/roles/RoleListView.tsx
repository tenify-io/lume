import { useState, useEffect } from "react";
import { GetRoles, GetClusterRoles } from "../../../wailsjs/go/main/App";
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

export function RoleListView() {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<kube.RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([GetRoles(selectedNamespace), GetClusterRoles()])
      .then(([roleResult, clusterRoleResult]) => {
        if (!cancelled) {
          const merged = [...(roleResult || []), ...(clusterRoleResult || [])];
          merged.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
            if (a.namespace !== b.namespace)
              return a.namespace.localeCompare(b.namespace);
            return a.name.localeCompare(b.name);
          });
          setRoles(merged);
        }
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
  }, [selectedNamespace, setError]);

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.namespace.toLowerCase().includes(search.toLowerCase()) ||
      r.kind.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredRoles.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No roles found.</p>
        </div>
      )}

      {/* Role table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {["Name", "Namespace", "Kind", "Rules", "Age"].map((h) => (
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
            {filteredRoles.map((r) => (
              <tr
                key={`${r.kind}/${r.namespace}/${r.name}`}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() => {
                  if (r.kind === "ClusterRole") {
                    navigate({
                      page: "clusterrole-detail",
                      name: r.name,
                    });
                  } else {
                    navigate({
                      page: "role-detail",
                      namespace: r.namespace,
                      name: r.name,
                    });
                  }
                }}
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {r.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {r.namespace || "\u2014"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-sm ${
                      r.kind === "ClusterRole"
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-zinc-400 bg-zinc-800"
                    }`}
                  >
                    {r.kind}
                  </span>
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {r.rules}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {r.age}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredRoles.length} role(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
