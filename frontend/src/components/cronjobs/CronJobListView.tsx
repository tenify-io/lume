import { GetCronJobs, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

function cronJobStatus(cj: kube.CronJobInfo): string {
  if (cj.active > 0) return "Active";
  if (cj.suspend) return "Suspended";
  return "Idle";
}

export function CronJobListView() {
  return (
    <ResourceListView<kube.CronJobInfo>
      fetchItems={(ns) => GetCronJobs(ns)}
      eventChannel="cronjobs:changed"
      getKey={(cj) => cj.namespace + "/" + cj.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (cj) => cj.name },
        { header: "Namespace", render: (cj) => cj.namespace },
        { header: "Status", render: (cj) => <StatusBadge status={cronJobStatus(cj)} /> },
        { header: "Schedule", className: "font-mono text-xs", render: (cj) => cj.schedule },
        { header: "Suspend", render: (cj) => cj.suspend ? "Yes" : "No" },
        { header: "Active", render: (cj) => cj.active },
        { header: "Last Schedule", render: (cj) => cj.lastSchedule || "\u2014" },
        { header: "Age", render: (cj) => cj.age },
        { header: "Images", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (cj) => cj.images?.join(", ") || "\u2014" },
      ]}
      filterPredicate={(cj, search) =>
        cj.name.toLowerCase().includes(search) ||
        cj.namespace.toLowerCase().includes(search)
      }
      onRowClick={(cj) => ({
        page: "cronjob-detail",
        namespace: cj.namespace,
        name: cj.name,
      })}
      resourceName="cronjob"
      searchPlaceholder="Search cronjobs..."
      emptyMessage="No cronjobs found."
    />
  );
}
