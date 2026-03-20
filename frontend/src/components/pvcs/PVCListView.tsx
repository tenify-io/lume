import { GetPVCs, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function PVCListView() {
  return (
    <ResourceListView<kube.PVCInfo>
      fetchItems={(ns) => GetPVCs(ns)}
      eventChannel="pvcs:changed"
      getKey={(pvc) => pvc.namespace + "/" + pvc.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (pvc) => pvc.name },
        { header: "Namespace", render: (pvc) => pvc.namespace },
        { header: "Status", render: (pvc) => <StatusBadge status={pvc.status} /> },
        { header: "Volume", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[250px]", render: (pvc) => pvc.volume || "\u2014" },
        { header: "Capacity", className: "font-mono text-xs", render: (pvc) => pvc.capacity || "\u2014" },
        { header: "Access Modes", className: "font-mono text-xs", render: (pvc) => pvc.accessModes || "\u2014" },
        { header: "Storage Class", render: (pvc) => pvc.storageClass || "\u2014" },
        { header: "Age", render: (pvc) => pvc.age },
      ]}
      filterPredicate={(pvc, search) =>
        pvc.name.toLowerCase().includes(search) ||
        pvc.namespace.toLowerCase().includes(search) ||
        pvc.status.toLowerCase().includes(search) ||
        pvc.volume.toLowerCase().includes(search) ||
        pvc.storageClass.toLowerCase().includes(search)
      }
      onRowClick={(pvc) => ({
        page: "pvc-detail",
        namespace: pvc.namespace,
        name: pvc.name,
      })}
      resourceName="PVC"
      searchPlaceholder="Search PVCs..."
      emptyMessage="No persistent volume claims found."
    />
  );
}
