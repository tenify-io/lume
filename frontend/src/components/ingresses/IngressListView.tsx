import { GetIngresses, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function IngressListView() {
  return (
    <ResourceListView<kube.IngressInfo>
      fetchItems={(ns) => GetIngresses(ns)}
      eventChannel="ingresses:changed"
      getKey={(ing) => ing.namespace + "/" + ing.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (ing) => ing.name },
        { header: "Namespace", render: (ing) => ing.namespace },
        { header: "Class", render: (ing) => ing.class || "\u2014" },
        { header: "Hosts", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (ing) => ing.hosts || "\u2014" },
        { header: "Address", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[200px]", render: (ing) => ing.address || "\u2014" },
        { header: "Ports", className: "font-mono text-xs", render: (ing) => ing.ports || "\u2014" },
        { header: "Age", render: (ing) => ing.age },
      ]}
      filterPredicate={(ing, search) =>
        ing.name.toLowerCase().includes(search) ||
        ing.namespace.toLowerCase().includes(search) ||
        ing.hosts.toLowerCase().includes(search)
      }
      onRowClick={(ing) => ({
        page: "ingress-detail",
        namespace: ing.namespace,
        name: ing.name,
      })}
      resourceName="ingress"
      searchPlaceholder="Search ingresses..."
      emptyMessage="No ingresses found."
    />
  );
}
