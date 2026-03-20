import { GetNetworkPolicies, WatchPods, UnwatchAll } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { ResourceListView } from "@/components/shared/ResourceListView";

export function NetworkPolicyListView() {
  return (
    <ResourceListView<kube.NetworkPolicyInfo>
      fetchItems={(ns) => GetNetworkPolicies(ns)}
      eventChannel="networkpolicies:changed"
      getKey={(np) => np.namespace + "/" + np.name}
      sortItems={(a, b) => {
        if (a.namespace !== b.namespace)
          return a.namespace.localeCompare(b.namespace);
        return a.name.localeCompare(b.name);
      }}
      startWatch={(ns) => WatchPods(ns)}
      stopWatch={() => UnwatchAll()}
      columns={[
        { header: "Name", className: "overflow-hidden text-ellipsis max-w-[300px]", render: (np) => np.name },
        { header: "Namespace", render: (np) => np.namespace },
        { header: "Pod Selector", className: "font-mono text-xs overflow-hidden text-ellipsis max-w-[300px]", render: (np) => np.podSelector || "(all pods)" },
        { header: "Policy Types", render: (np) => np.policyTypes && np.policyTypes.length > 0 ? np.policyTypes.join(", ") : "\u2014" },
        { header: "Age", render: (np) => np.age },
      ]}
      filterPredicate={(np, search) =>
        np.name.toLowerCase().includes(search) ||
        np.namespace.toLowerCase().includes(search) ||
        np.podSelector.toLowerCase().includes(search)
      }
      onRowClick={(np) => ({
        page: "networkpolicy-detail",
        namespace: np.namespace,
        name: np.name,
      })}
      resourceName="network policy"
      searchPlaceholder="Search network policies..."
      emptyMessage="No network policies found."
    />
  );
}
