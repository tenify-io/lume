import { GetPersistentVolumes } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function PersistentVolumeListView() {
  return (
    <ResourceListView<kube.PersistentVolumeInfo>
      fetchItems={() => GetPersistentVolumes()}
      eventChannel="persistentvolumes:changed"
      getKey={(pv) => pv.name}
      sortItems={(a, b) => a.name.localeCompare(b.name)}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (pv) => pv.name },
        { header: "Capacity", className: "font-mono text-xs", render: (pv) => pv.capacity || "\u2014" },
        { header: "Access Modes", className: "font-mono text-xs", render: (pv) => pv.accessModes || "\u2014" },
        { header: "Reclaim Policy", render: (pv) => pv.reclaimPolicy || "\u2014" },
        { header: "Status", render: (pv) => <StatusBadge status={pv.status} /> },
        { header: "Claim", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[250px]", render: (pv) => pv.claim || "\u2014" },
        { header: "Storage Class", render: (pv) => pv.storageClass || "\u2014" },
        { header: "Age", render: (pv) => pv.age },
      ]}
      filterPredicate={(pv, search) =>
        pv.name.toLowerCase().includes(search) ||
        pv.status.toLowerCase().includes(search) ||
        pv.storageClass.toLowerCase().includes(search) ||
        pv.claim.toLowerCase().includes(search)
      }
      onRowClick={(pv) => ({
        page: "persistentvolume-detail",
        name: pv.name,
      })}
      resourceName="persistent volume"
      searchPlaceholder="Search persistent volumes..."
      emptyMessage="No persistent volumes found."
      namespaceScoped={false}
    />
  );
}
