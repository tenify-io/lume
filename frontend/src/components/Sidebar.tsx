import { Server, Box, Layers, Database, GitBranch, Copy, PlayCircle, Timer, Network, Globe, Shield, FileText, KeyRound, HardDrive, FolderArchive, Archive, UserCircle, ShieldCheck, Link, FolderOpen } from "lucide-react";
import { useNavigation, type Route } from "@/navigation";

interface NavItem {
  label: string;
  icon: React.ElementType;
  page: Route["page"];
}

const categories: { label: string; items: NavItem[] }[] = [
  {
    label: "Cluster",
    items: [
      { label: "Namespaces", icon: FolderOpen, page: "namespaces" },
      { label: "Nodes", icon: Server, page: "nodes" },
    ],
  },
  {
    label: "Workloads",
    items: [
      { label: "Deployments", icon: Layers, page: "deployments" },
      { label: "StatefulSets", icon: Database, page: "statefulsets" },
      { label: "DaemonSets", icon: GitBranch, page: "daemonsets" },
      { label: "ReplicaSets", icon: Copy, page: "replicasets" },
      { label: "Jobs", icon: PlayCircle, page: "jobs" },
      { label: "CronJobs", icon: Timer, page: "cronjobs" },
      { label: "Pods", icon: Box, page: "pods" },
    ],
  },
  {
    label: "Networking",
    items: [
      { label: "Services", icon: Network, page: "services" },
      { label: "Ingresses", icon: Globe, page: "ingresses" },
      { label: "NetworkPolicies", icon: Shield, page: "networkpolicies" },
    ],
  },
  {
    label: "Storage",
    items: [
      { label: "StorageClasses", icon: Archive, page: "storageclasses" },
      { label: "PersistentVolumes", icon: HardDrive, page: "persistentvolumes" },
      { label: "PVCs", icon: FolderArchive, page: "pvcs" },
    ],
  },
  {
    label: "Access Control",
    items: [
      { label: "ServiceAccounts", icon: UserCircle, page: "serviceaccounts" },
      { label: "Roles", icon: ShieldCheck, page: "roles" },
      { label: "Bindings", icon: Link, page: "rolebindings" },
    ],
  },
  {
    label: "Config",
    items: [
      { label: "ConfigMaps", icon: FileText, page: "configmaps" },
      { label: "Secrets", icon: KeyRound, page: "secrets" },
    ],
  },
];

export function Sidebar() {
  const { route, navigate } = useNavigation();

  // Determine which page is "active" — detail views highlight their parent list
  const activePage =
    route.page === "pod-detail"
      ? "pods"
      : route.page === "namespace-detail"
        ? "namespaces"
        : route.page === "node-detail"
          ? "nodes"
        : route.page === "deployment-detail"
          ? "deployments"
          : route.page === "statefulset-detail"
            ? "statefulsets"
            : route.page === "daemonset-detail"
              ? "daemonsets"
              : route.page === "replicaset-detail"
                ? "replicasets"
                : route.page === "job-detail"
                  ? "jobs"
                  : route.page === "cronjob-detail"
                    ? "cronjobs"
                    : route.page === "service-detail"
                      ? "services"
                      : route.page === "ingress-detail"
                        ? "ingresses"
                        : route.page === "networkpolicy-detail"
                          ? "networkpolicies"
                          : route.page === "configmap-detail"
                            ? "configmaps"
                            : route.page === "secret-detail"
                              ? "secrets"
                              : route.page === "pvc-detail"
                                ? "pvcs"
                                : route.page === "persistentvolume-detail"
                                  ? "persistentvolumes"
                                  : route.page === "storageclass-detail"
                                    ? "storageclasses"
                                    : route.page === "serviceaccount-detail"
                                      ? "serviceaccounts"
                                      : route.page === "role-detail"
                                        ? "roles"
                                        : route.page === "clusterrole-detail"
                                          ? "roles"
                                          : route.page === "rolebinding-detail"
                                            ? "rolebindings"
                                            : route.page === "clusterrolebinding-detail"
                                              ? "rolebindings"
                                              : route.page;

  return (
    <nav className="w-[180px] shrink-0 bg-zinc-950 border-r border-black/50 py-4 flex flex-col gap-5 overflow-y-auto">
      {categories.map((cat) => (
        <div key={cat.label}>
          <div className="px-4 mb-1.5 text-[11px] font-bold text-zinc-600 uppercase tracking-wide">
            {cat.label}
          </div>
          {cat.items.map((item) => {
            const isActive = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => navigate({ page: item.page } as Route)}
                className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-zinc-200 font-medium border-l-2 border-blue-500"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300 border-l-2 border-transparent"
                }`}
              >
                <item.icon size={15} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
