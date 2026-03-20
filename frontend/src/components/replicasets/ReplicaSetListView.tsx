import { GetReplicaSets, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

function replicaSetStatus(rs: kube.ReplicaSetInfo): string {
  if (rs.desired === 0) return "Scaled Down";
  if (rs.ready === rs.desired) return "Ready";
  if (rs.ready < rs.desired) return "Progressing";
  return "Ready";
}

export function ReplicaSetListView() {
  return (
    <ResourceListView<kube.ReplicaSetInfo>
      fetchItems={(ns) => GetReplicaSets(ns)}
      eventChannel="replicasets:changed"
      getKey={(rs) => rs.namespace + "/" + rs.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (rs) => rs.name },
        { header: "Namespace", render: (rs) => rs.namespace },
        { header: "Status", render: (rs) => <StatusBadge status={replicaSetStatus(rs)} /> },
        { header: "Desired", render: (rs) => rs.desired },
        { header: "Current", render: (rs) => rs.current },
        { header: "Ready", render: (rs) => rs.ready },
        { header: "Age", render: (rs) => rs.age },
        { header: "Owner", className: "text-zinc-200", render: (rs) => rs.owner || "\u2014" },
        { header: "Images", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (rs) => rs.images?.join(", ") || "\u2014" },
      ]}
      filterPredicate={(rs, search) =>
        rs.name.toLowerCase().includes(search) ||
        rs.namespace.toLowerCase().includes(search) ||
        (rs.owner ? rs.owner.toLowerCase().includes(search) : false)
      }
      onRowClick={(rs) => ({
        page: "replicaset-detail",
        namespace: rs.namespace,
        name: rs.name,
      })}
      resourceName="replicaset"
      searchPlaceholder="Search replicasets..."
      emptyMessage="No replicasets found."
    />
  );
}
