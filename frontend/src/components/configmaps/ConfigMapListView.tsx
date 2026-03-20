import { GetConfigMaps, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function ConfigMapListView() {
  return (
    <ResourceListView<kube.ConfigMapInfo>
      fetchItems={(ns) => GetConfigMaps(ns)}
      eventChannel="configmaps:changed"
      getKey={(cm) => cm.namespace + "/" + cm.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (cm) => cm.name },
        { header: "Namespace", render: (cm) => cm.namespace },
        { header: "Data", render: (cm) => cm.dataCount },
        { header: "Age", render: (cm) => cm.age },
      ]}
      filterPredicate={(cm, search) =>
        cm.name.toLowerCase().includes(search) ||
        cm.namespace.toLowerCase().includes(search)
      }
      onRowClick={(cm) => ({
        page: "configmap-detail",
        namespace: cm.namespace,
        name: cm.name,
      })}
      resourceName="config map"
      searchPlaceholder="Search config maps..."
      emptyMessage="No config maps found."
    />
  );
}
