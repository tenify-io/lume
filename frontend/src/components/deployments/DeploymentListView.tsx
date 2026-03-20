import { GetDeployments, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

function deploymentStatus(dep: kube.DeploymentInfo): string {
  const parts = dep.ready.split("/");
  const ready = parseInt(parts[0], 10);
  const desired = parseInt(parts[1], 10);
  if (desired === 0) return "Scaled Down";
  if (ready === desired && dep.available === desired) return "Available";
  if (ready < desired) return "Progressing";
  return "Available";
}

export function DeploymentListView() {
  return (
    <ResourceListView<kube.DeploymentInfo>
      fetchItems={(ns) => GetDeployments(ns)}
      eventChannel="deployments:changed"
      getKey={(dep) => dep.namespace + "/" + dep.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (dep) => dep.name },
        { header: "Namespace", render: (dep) => dep.namespace },
        { header: "Status", render: (dep) => <StatusBadge status={deploymentStatus(dep)} /> },
        { header: "Ready", render: (dep) => dep.ready },
        { header: "Up-to-Date", render: (dep) => dep.upToDate },
        { header: "Available", render: (dep) => dep.available },
        { header: "Age", render: (dep) => dep.age },
        { header: "Images", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (dep) => dep.images?.join(", ") || "\u2014" },
      ]}
      filterPredicate={(dep, search) =>
        dep.name.toLowerCase().includes(search) ||
        dep.namespace.toLowerCase().includes(search)
      }
      onRowClick={(dep) => ({
        page: "deployment-detail",
        namespace: dep.namespace,
        name: dep.name,
      })}
      resourceName="deployment"
      searchPlaceholder="Search deployments..."
      emptyMessage="No deployments found."
    />
  );
}
