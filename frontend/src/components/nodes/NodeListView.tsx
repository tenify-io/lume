import { GetNodes } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function NodeListView() {
  return (
    <ResourceListView<kube.NodeInfo>
      fetchItems={() => GetNodes()}
      eventChannel="nodes:changed"
      getKey={(node) => node.name}
      sortItems={(a, b) => a.name.localeCompare(b.name)}
      columns={[
        { header: "Name", render: (node) => node.name },
        { header: "Status", render: (node) => <StatusBadge status={node.status} /> },
        { header: "Roles", render: (node) => node.roles },
        { header: "Age", render: (node) => node.age },
        { header: "Version", render: (node) => node.kubeletVersion },
        { header: "Internal IP", className: "font-mono text-xs", render: (node) => node.internalIP },
        { header: "OS Image", render: (node) => node.osImage },
        { header: "Runtime", className: "text-xs", render: (node) => node.containerRuntime },
      ]}
      filterPredicate={(node, search) =>
        node.name.toLowerCase().includes(search) ||
        node.status.toLowerCase().includes(search) ||
        node.roles.toLowerCase().includes(search)
      }
      onRowClick={(node) => ({
        page: "node-detail",
        name: node.name,
      })}
      resourceName="node"
      searchPlaceholder="Search nodes..."
      emptyMessage="No nodes found."
      namespaceScoped={false}
    />
  );
}
