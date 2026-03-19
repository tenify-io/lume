import { NavigationProvider, useNavigation } from "@/navigation";
import { ClusterProvider, useCluster } from "@/contexts/ClusterContext";
import ClusterSelectView from "@/components/ClusterSelectView";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { PodListView } from "@/components/pods/PodListView";
import { PodDetailView } from "@/components/pods/PodDetailView";
import { NodeListView } from "@/components/nodes/NodeListView";
import { NodeDetailView } from "@/components/nodes/NodeDetailView";
import { DeploymentListView } from "@/components/deployments/DeploymentListView";
import { DeploymentDetailView } from "@/components/deployments/DeploymentDetailView";

function AppRouter() {
  const { route } = useNavigation();
  const cluster = useCluster();

  if (cluster.initializing) {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 font-sans text-[13px]">
        <TopBar />
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (route.page === "cluster-select") {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 font-sans text-[13px]">
        <TopBar />
        <ClusterSelectView
          contexts={cluster.contexts}
          aliases={cluster.aliases}
          onConnect={cluster.connectToCluster}
          onAliasChange={cluster.handleAliasChange}
          connecting={cluster.connecting}
          connectingContext={cluster.connectingContext}
        />
      </div>
    );
  }

  return (
    <AppShell>
      {route.page === "pods" && <PodListView />}
      {route.page === "pod-detail" && (
        <PodDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "nodes" && <NodeListView />}
      {route.page === "node-detail" && (
        <NodeDetailView name={route.name} />
      )}
      {route.page === "deployments" && <DeploymentListView />}
      {route.page === "deployment-detail" && (
        <DeploymentDetailView namespace={route.namespace} name={route.name} />
      )}
    </AppShell>
  );
}

function App() {
  return (
    <NavigationProvider>
      <ClusterProvider>
        <AppRouter />
      </ClusterProvider>
    </NavigationProvider>
  );
}

export default App;
