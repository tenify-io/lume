import { useState } from "react";
import { GetJobs, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
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

export function JobListView() {
  const { navigate } = useNavigation();
  const { namespaces, selectedNamespace, setSelectedNamespace, setError } =
    useCluster();
  const [search, setSearch] = useState("");

  const { items: jobs, loading } = useResourceList<kube.JobInfo>({
    fetchItems: () => GetJobs(selectedNamespace),
    eventChannel: "jobs:changed",
    getKey: (job) => job.namespace + "/" + job.name,
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

  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(search.toLowerCase()) ||
      job.namespace.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] bg-zinc-950"
          />
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>No jobs found.</p>
        </div>
      )}

      {/* Job table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse table-auto">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                "Name",
                "Namespace",
                "Status",
                "Completions",
                "Duration",
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
            {filteredJobs.map((job) => (
              <tr
                key={job.namespace + "/" + job.name}
                className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                onClick={() =>
                  navigate({
                    page: "job-detail",
                    namespace: job.namespace,
                    name: job.name,
                  })
                }
              >
                <td className="px-3 py-2 border-b border-zinc-800/30 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                  {job.name}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {job.namespace}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {job.completions}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {job.duration || "—"}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                  {job.age}
                </td>
                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]">
                  {job.images?.join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1.5 text-xs text-zinc-600 bg-[#111113] border-t border-zinc-800/50 shrink-0">
        {loading ? "Loading..." : `${filteredJobs.length} job(s)`}
        {search && ` matching "${search}"`}
      </div>
    </>
  );
}
