import { useState, ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigation, Route } from "@/navigation";
import { useCluster } from "@/contexts/ClusterContext";
import { useResourceList } from "@/hooks/useResourceList";

export interface ColumnDef<T> {
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export interface ResourceListViewProps<T> {
  fetchItems: (namespace: string) => Promise<T[]>;
  eventChannel: string;
  getKey: (item: T) => string;
  sortItems: (a: T, b: T) => number;
  startWatch?: (namespace: string) => Promise<void>;
  stopWatch?: () => Promise<void>;
  columns: ColumnDef<T>[];
  filterPredicate: (item: T, search: string) => boolean;
  onRowClick: (item: T) => Route;
  resourceName: string;
  searchPlaceholder: string;
  emptyMessage: string;
  namespaceScoped?: boolean;
}

export function ResourceListView<T>({
  fetchItems,
  eventChannel,
  getKey,
  sortItems,
  startWatch,
  stopWatch,
  columns,
  filterPredicate,
  onRowClick,
  resourceName,
  searchPlaceholder,
  emptyMessage,
  namespaceScoped = true,
}: ResourceListViewProps<T>) {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");

  const { items, loading } = useResourceList<T>({
    fetchItems: () => fetchItems(selectedNamespace),
    eventChannel,
    getKey,
    sortItems,
    startWatch: startWatch
      ? () => startWatch(selectedNamespace)
      : undefined,
    stopWatch,
    onError: setError,
    deps: namespaceScoped ? [selectedNamespace] : [],
  });

  const searchLower = search.toLowerCase();
  const filtered = search
    ? items.filter((item) => filterPredicate(item, searchLower))
    : items;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900 border-b border-zinc-800/50">
        {namespaceScoped && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Namespace:
            </label>
            <Select
              value={selectedNamespace || "__all__"}
              onValueChange={(ns) =>
                setSelectedNamespace(!ns || ns === "__all__" ? "" : ns)
              }
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
        )}

        <div className="ml-auto">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>{emptyMessage}</p>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={getKey(item)}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() => navigate(onRowClick(item))}
              >
                {columns.map((col, i) => (
                  <td
                    key={col.header}
                    className={`px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap${
                      i === 0 ? " font-semibold text-zinc-200" : ""
                    }${col.className ? " " + col.className : ""}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filtered.length} ${resourceName}(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
