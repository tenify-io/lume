import { GetDaemonSets, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

function daemonSetStatus(ds: kube.DaemonSetInfo): string {
  if (ds.desired === 0) return "Scaled Down";
  if (ds.ready === ds.desired) return "Ready";
  if (ds.ready < ds.desired) return "Progressing";
  return "Ready";
}

export function DaemonSetListView() {
  return (
    <ResourceListView<kube.DaemonSetInfo>
      fetchItems={(ns) => GetDaemonSets(ns)}
      eventChannel="daemonsets:changed"
      getKey={(ds) => ds.namespace + "/" + ds.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (ds) => ds.name },
        { header: "Namespace", render: (ds) => ds.namespace },
        { header: "Status", render: (ds) => <StatusBadge status={daemonSetStatus(ds)} /> },
        { header: "Desired", render: (ds) => ds.desired },
        { header: "Current", render: (ds) => ds.current },
        { header: "Ready", render: (ds) => ds.ready },
        { header: "Up-to-Date", render: (ds) => ds.upToDate },
        { header: "Available", render: (ds) => ds.available },
        { header: "Age", render: (ds) => ds.age },
        { header: "Images", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (ds) => ds.images?.join(", ") || "\u2014" },
      ]}
      filterPredicate={(ds, search) =>
        ds.name.toLowerCase().includes(search) ||
        ds.namespace.toLowerCase().includes(search)
      }
      onRowClick={(ds) => ({
        page: "daemonset-detail",
        namespace: ds.namespace,
        name: ds.name,
      })}
      resourceName="daemonset"
      searchPlaceholder="Search daemonsets..."
      emptyMessage="No daemonsets found."
    />
  );
}
