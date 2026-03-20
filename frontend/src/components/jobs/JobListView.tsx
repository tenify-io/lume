import { GetJobs, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function JobListView() {
  return (
    <ResourceListView<kube.JobInfo>
      fetchItems={(ns) => GetJobs(ns)}
      eventChannel="jobs:changed"
      getKey={(job) => job.namespace + "/" + job.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (job) => job.name },
        { header: "Namespace", render: (job) => job.namespace },
        { header: "Status", render: (job) => <StatusBadge status={job.status} /> },
        { header: "Completions", render: (job) => job.completions },
        { header: "Duration", render: (job) => job.duration || "\u2014" },
        { header: "Age", render: (job) => job.age },
        { header: "Images", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (job) => job.images?.join(", ") || "\u2014" },
      ]}
      filterPredicate={(job, search) =>
        job.name.toLowerCase().includes(search) ||
        job.namespace.toLowerCase().includes(search)
      }
      onRowClick={(job) => ({
        page: "job-detail",
        namespace: job.namespace,
        name: job.name,
      })}
      resourceName="job"
      searchPlaceholder="Search jobs..."
      emptyMessage="No jobs found."
    />
  );
}
