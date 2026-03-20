import { GetSecrets, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function SecretListView() {
  return (
    <ResourceListView<kube.SecretInfo>
      fetchItems={(ns) => GetSecrets(ns)}
      eventChannel="secrets:changed"
      getKey={(s) => s.namespace + "/" + s.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (s) => s.name },
        { header: "Namespace", render: (s) => s.namespace },
        { header: "Type", render: (s) => s.type },
        { header: "Data", render: (s) => s.dataCount },
        { header: "Age", render: (s) => s.age },
      ]}
      filterPredicate={(s, search) =>
        s.name.toLowerCase().includes(search) ||
        s.namespace.toLowerCase().includes(search) ||
        s.type.toLowerCase().includes(search)
      }
      onRowClick={(s) => ({
        page: "secret-detail",
        namespace: s.namespace,
        name: s.name,
      })}
      resourceName="secret"
      searchPlaceholder="Search secrets..."
      emptyMessage="No secrets found."
    />
  );
}
