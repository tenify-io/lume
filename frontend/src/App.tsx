import { NavigationProvider, useNavigation } from "@/navigation";
import { ClusterProvider, useCluster } from "@/contexts/ClusterContext";
import ClusterSelectView from "@/components/ClusterSelectView";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { PodListView } from "@/components/pods/PodListView";
import { PodDetailView } from "@/components/pods/PodDetailView";
import { NamespaceListView } from "@/components/namespaces/NamespaceListView";
import { NamespaceDetailView } from "@/components/namespaces/NamespaceDetailView";
import { NodeListView } from "@/components/nodes/NodeListView";
import { NodeDetailView } from "@/components/nodes/NodeDetailView";
import { DeploymentListView } from "@/components/deployments/DeploymentListView";
import { DeploymentDetailView } from "@/components/deployments/DeploymentDetailView";
import { StatefulSetListView } from "@/components/statefulsets/StatefulSetListView";
import { StatefulSetDetailView } from "@/components/statefulsets/StatefulSetDetailView";
import { DaemonSetListView } from "@/components/daemonsets/DaemonSetListView";
import { DaemonSetDetailView } from "@/components/daemonsets/DaemonSetDetailView";
import { ReplicaSetListView } from "@/components/replicasets/ReplicaSetListView";
import { ReplicaSetDetailView } from "@/components/replicasets/ReplicaSetDetailView";
import { JobListView } from "@/components/jobs/JobListView";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { CronJobListView } from "@/components/cronjobs/CronJobListView";
import { CronJobDetailView } from "@/components/cronjobs/CronJobDetailView";
import { ServiceListView } from "@/components/services/ServiceListView";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { IngressListView } from "@/components/ingresses/IngressListView";
import { IngressDetailView } from "@/components/ingresses/IngressDetailView";
import { NetworkPolicyListView } from "@/components/networkpolicies/NetworkPolicyListView";
import { NetworkPolicyDetailView } from "@/components/networkpolicies/NetworkPolicyDetailView";
import { ConfigMapListView } from "@/components/configmaps/ConfigMapListView";
import { ConfigMapDetailView } from "@/components/configmaps/ConfigMapDetailView";
import { SecretListView } from "@/components/secrets/SecretListView";
import { SecretDetailView } from "@/components/secrets/SecretDetailView";
import { PVCListView } from "@/components/pvcs/PVCListView";
import { PVCDetailView } from "@/components/pvcs/PVCDetailView";
import { PersistentVolumeListView } from "@/components/persistentvolumes/PersistentVolumeListView";
import { PersistentVolumeDetailView } from "@/components/persistentvolumes/PersistentVolumeDetailView";
import { StorageClassListView } from "@/components/storageclasses/StorageClassListView";
import { StorageClassDetailView } from "@/components/storageclasses/StorageClassDetailView";
import { ServiceAccountListView } from "@/components/serviceaccounts/ServiceAccountListView";
import { ServiceAccountDetailView } from "@/components/serviceaccounts/ServiceAccountDetailView";
import { RoleListView } from "@/components/roles/RoleListView";
import { RoleDetailView } from "@/components/roles/RoleDetailView";
import { RoleBindingListView } from "@/components/rolebindings/RoleBindingListView";
import { RoleBindingDetailView } from "@/components/rolebindings/RoleBindingDetailView";

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
      {route.page === "namespaces" && <NamespaceListView />}
      {route.page === "namespace-detail" && (
        <NamespaceDetailView name={route.name} />
      )}
      {route.page === "nodes" && <NodeListView />}
      {route.page === "node-detail" && (
        <NodeDetailView name={route.name} />
      )}
      {route.page === "deployments" && <DeploymentListView />}
      {route.page === "deployment-detail" && (
        <DeploymentDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "statefulsets" && <StatefulSetListView />}
      {route.page === "statefulset-detail" && (
        <StatefulSetDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "daemonsets" && <DaemonSetListView />}
      {route.page === "daemonset-detail" && (
        <DaemonSetDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "replicasets" && <ReplicaSetListView />}
      {route.page === "replicaset-detail" && (
        <ReplicaSetDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "jobs" && <JobListView />}
      {route.page === "job-detail" && (
        <JobDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "cronjobs" && <CronJobListView />}
      {route.page === "cronjob-detail" && (
        <CronJobDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "services" && <ServiceListView />}
      {route.page === "service-detail" && (
        <ServiceDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "ingresses" && <IngressListView />}
      {route.page === "ingress-detail" && (
        <IngressDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "networkpolicies" && <NetworkPolicyListView />}
      {route.page === "networkpolicy-detail" && (
        <NetworkPolicyDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "configmaps" && <ConfigMapListView />}
      {route.page === "configmap-detail" && (
        <ConfigMapDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "secrets" && <SecretListView />}
      {route.page === "secret-detail" && (
        <SecretDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "pvcs" && <PVCListView />}
      {route.page === "pvc-detail" && (
        <PVCDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "persistentvolumes" && <PersistentVolumeListView />}
      {route.page === "persistentvolume-detail" && (
        <PersistentVolumeDetailView name={route.name} />
      )}
      {route.page === "storageclasses" && <StorageClassListView />}
      {route.page === "storageclass-detail" && (
        <StorageClassDetailView name={route.name} />
      )}
      {route.page === "serviceaccounts" && <ServiceAccountListView />}
      {route.page === "serviceaccount-detail" && (
        <ServiceAccountDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "roles" && <RoleListView />}
      {route.page === "role-detail" && (
        <RoleDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "clusterrole-detail" && (
        <RoleDetailView name={route.name} isClusterRole />
      )}
      {route.page === "rolebindings" && <RoleBindingListView />}
      {route.page === "rolebinding-detail" && (
        <RoleBindingDetailView namespace={route.namespace} name={route.name} />
      )}
      {route.page === "clusterrolebinding-detail" && (
        <RoleBindingDetailView name={route.name} isClusterRoleBinding />
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
