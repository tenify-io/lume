import { GetServices, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function ServiceListView() {
  return (
    <ResourceListView<kube.ServiceInfo>
      fetchItems={(ns) => GetServices(ns)}
      eventChannel="services:changed"
      getKey={(svc) => svc.namespace + "/" + svc.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (svc) => svc.name },
        { header: "Namespace", render: (svc) => svc.namespace },
        { header: "Type", render: (svc) => <StatusBadge status={svc.type} /> },
        { header: "Cluster IP", className: "font-mono text-xs", render: (svc) => svc.clusterIP || "\u2014" },
        { header: "External IP", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[200px]", render: (svc) => svc.externalIP || "\u2014" },
        { header: "Ports", className: "font-mono text-xs", render: (svc) => svc.ports || "\u2014" },
        { header: "Age", render: (svc) => svc.age },
        { header: "Selector", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (svc) => svc.selector || "\u2014" },
      ]}
      filterPredicate={(svc, search) =>
        svc.name.toLowerCase().includes(search) ||
        svc.namespace.toLowerCase().includes(search)
      }
      onRowClick={(svc) => ({
        page: "service-detail",
        namespace: svc.namespace,
        name: svc.name,
      })}
      resourceName="service"
      searchPlaceholder="Search services..."
      emptyMessage="No services found."
    />
  );
}
