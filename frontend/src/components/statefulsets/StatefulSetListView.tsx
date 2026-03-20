import { GetStatefulSets, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

function statefulSetStatus(ss: kube.StatefulSetInfo): string {
  const parts = ss.ready.split("/");
  const ready = parseInt(parts[0], 10);
  const desired = parseInt(parts[1], 10);
  if (desired === 0) return "Scaled Down";
  if (ready === desired) return "Ready";
  if (ready < desired) return "Progressing";
  return "Ready";
}

export function StatefulSetListView() {
  return (
    <ResourceListView<kube.StatefulSetInfo>
      fetchItems={(ns) => GetStatefulSets(ns)}
      eventChannel="statefulsets:changed"
      getKey={(ss) => ss.namespace + "/" + ss.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (ss) => ss.name },
        { header: "Namespace", render: (ss) => ss.namespace },
        { header: "Status", render: (ss) => <StatusBadge status={statefulSetStatus(ss)} /> },
        { header: "Ready", render: (ss) => ss.ready },
        { header: "Age", render: (ss) => ss.age },
        { header: "Images", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (ss) => ss.images?.join(", ") || "\u2014" },
      ]}
      filterPredicate={(ss, search) =>
        ss.name.toLowerCase().includes(search) ||
        ss.namespace.toLowerCase().includes(search)
      }
      onRowClick={(ss) => ({
        page: "statefulset-detail",
        namespace: ss.namespace,
        name: ss.name,
      })}
      resourceName="statefulset"
      searchPlaceholder="Search statefulsets..."
      emptyMessage="No statefulsets found."
    />
  );
}
