import { GetPods, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function PodListView() {
  return (
    <ResourceListView<kube.PodInfo>
      fetchItems={(ns) => GetPods(ns)}
      eventChannel="pods:changed"
      getKey={(pod) => pod.namespace + "/" + pod.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (p) => p.name },
        { header: "Namespace", render: (p) => p.namespace },
        { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
        { header: "Ready", render: (p) => p.ready },
        { header: "Restarts", render: (p) => p.restarts },
        { header: "Age", render: (p) => p.age },
        { header: "Node", render: (p) => p.nodeName },
        { header: "IP", className: "font-mono text-xs", render: (p) => p.ip },
      ]}
      filterPredicate={(pod, search) =>
        pod.name.toLowerCase().includes(search) ||
        pod.namespace.toLowerCase().includes(search) ||
        pod.status.toLowerCase().includes(search)
      }
      onRowClick={(pod) => ({
        page: "pod-detail",
        namespace: pod.namespace,
        name: pod.name,
      })}
      resourceName="pod"
      searchPlaceholder="Search pods..."
      emptyMessage="No pods found."
    />
  );
}
