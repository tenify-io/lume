import { GetServiceAccounts, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function ServiceAccountListView() {
  return (
    <ResourceListView<kube.ServiceAccountInfo>
      fetchItems={(ns) => GetServiceAccounts(ns)}
      eventChannel="serviceaccounts:changed"
      getKey={(sa) => sa.namespace + "/" + sa.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (sa) => sa.name },
        { header: "Namespace", render: (sa) => sa.namespace },
        { header: "Secrets", render: (sa) => sa.secrets },
        { header: "Age", render: (sa) => sa.age },
      ]}
      filterPredicate={(sa, search) =>
        sa.name.toLowerCase().includes(search) ||
        sa.namespace.toLowerCase().includes(search)
      }
      onRowClick={(sa) => ({
        page: "serviceaccount-detail",
        namespace: sa.namespace,
        name: sa.name,
      })}
      resourceName="service account"
      searchPlaceholder="Search service accounts..."
      emptyMessage="No service accounts found."
    />
  );
}
