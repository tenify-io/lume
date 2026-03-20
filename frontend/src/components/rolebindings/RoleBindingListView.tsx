import { useState, useEffect } from "react";
import { GetRoleBindings, GetClusterRoleBindings } from "../../../wailsjs/go/main/App";
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

export function RoleBindingListView() {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");
  const [bindings, setBindings] = useState<kube.RoleBindingInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([GetRoleBindings(selectedNamespace), GetClusterRoleBindings()])
      .then(([rbResult, crbResult]) => {
        if (!cancelled) {
          const merged = [...(rbResult || []), ...(crbResult || [])];
          merged.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
            if (a.namespace !== b.namespace)
              return a.namespace.localeCompare(b.namespace);
            return a.name.localeCompare(b.name);
          });
          setBindings(merged);
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

  const filteredBindings = bindings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.namespace.toLowerCase().includes(search.toLowerCase()) ||
      b.kind.toLowerCase().includes(search.toLowerCase()) ||
      b.roleRef.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search bindings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredBindings.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No bindings found.</p>
        </div>
      )}

      {/* Binding table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {["Name", "Namespace", "Kind", "Role", "Subjects", "Age"].map((h) => (
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
            {filteredBindings.map((b) => (
              <tr
                key={`${b.kind}/${b.namespace}/${b.name}`}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() => {
                  if (b.kind === "ClusterRoleBinding") {
                    navigate({
                      page: "clusterrolebinding-detail",
                      name: b.name,
                    });
                  } else {
                    navigate({
                      page: "rolebinding-detail",
                      namespace: b.namespace,
                      name: b.name,
                    });
                  }
                }}
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {b.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {b.namespace || "\u2014"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-sm ${
                      b.kind === "ClusterRoleBinding"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-zinc-400 bg-zinc-800"
                    }`}
                  >
                    {b.kind}
                  </span>
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                  {b.roleRef}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {b.subjects}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {b.age}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredBindings.length} binding(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
