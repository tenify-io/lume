import { createContext, useCallback, useContext, useMemo, useReducer } from "react";

export type Route =
  | { page: "cluster-select" }
  | { page: "pods" }
  | { page: "pod-detail"; namespace: string; name: string }
  | { page: "namespaces" }
  | { page: "namespace-detail"; name: string }
  | { page: "nodes" }
  | { page: "node-detail"; name: string }
  | { page: "deployments" }
  | { page: "deployment-detail"; namespace: string; name: string }
  | { page: "statefulsets" }
  | { page: "statefulset-detail"; namespace: string; name: string }
  | { page: "daemonsets" }
  | { page: "daemonset-detail"; namespace: string; name: string }
  | { page: "replicasets" }
  | { page: "replicaset-detail"; namespace: string; name: string }
  | { page: "jobs" }
  | { page: "job-detail"; namespace: string; name: string }
  | { page: "cronjobs" }
  | { page: "cronjob-detail"; namespace: string; name: string }
  | { page: "services" }
  | { page: "service-detail"; namespace: string; name: string }
  | { page: "ingresses" }
  | { page: "ingress-detail"; namespace: string; name: string }
  | { page: "networkpolicies" }
  | { page: "networkpolicy-detail"; namespace: string; name: string }
  | { page: "configmaps" }
  | { page: "configmap-detail"; namespace: string; name: string }
  | { page: "secrets" }
  | { page: "secret-detail"; namespace: string; name: string }
  | { page: "pvcs" }
  | { page: "pvc-detail"; namespace: string; name: string }
  | { page: "persistentvolumes" }
  | { page: "persistentvolume-detail"; name: string }
  | { page: "storageclasses" }
  | { page: "storageclass-detail"; name: string }
  | { page: "serviceaccounts" }
  | { page: "serviceaccount-detail"; namespace: string; name: string }
  | { page: "roles" }
  | { page: "role-detail"; namespace: string; name: string }
  | { page: "clusterrole-detail"; name: string }
  | { page: "rolebindings" }
  | { page: "rolebinding-detail"; namespace: string; name: string }
  | { page: "clusterrolebinding-detail"; name: string };

export interface Tab {
  id: string;
  route: Route;
  backStack: Route[];
  forwardStack: Route[];
}

interface NavigationState {
  tabs: Tab[];
  activeTabId: string;
}

type NavAction =
  | { type: "NAVIGATE"; route: Route }
  | { type: "GO_BACK" }
  | { type: "GO_FORWARD" }
  | { type: "OPEN_TAB"; route?: Route }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "SWITCH_TAB"; tabId: string }
  | { type: "RESET_TABS"; route: Route };

function createTab(route: Route): Tab {
  return {
    id: crypto.randomUUID(),
    route,
    backStack: [],
    forwardStack: [],
  };
}

function updateActiveTab(state: NavigationState, updater: (tab: Tab) => Tab): NavigationState {
  return {
    ...state,
    tabs: state.tabs.map((t) => (t.id === state.activeTabId ? updater(t) : t)),
  };
}

function navReducer(state: NavigationState, action: NavAction): NavigationState {
  switch (action.type) {
    case "NAVIGATE":
      return updateActiveTab(state, (tab) => ({
        ...tab,
        backStack: [...tab.backStack, tab.route],
        forwardStack: [],
        route: action.route,
      }));

    case "GO_BACK": {
      const active = state.tabs.find((t) => t.id === state.activeTabId);
      if (!active || active.backStack.length === 0) return state;
      return updateActiveTab(state, (tab) => {
        const prev = tab.backStack[tab.backStack.length - 1];
        return {
          ...tab,
          backStack: tab.backStack.slice(0, -1),
          forwardStack: [...tab.forwardStack, tab.route],
          route: prev,
        };
      });
    }

    case "GO_FORWARD": {
      const active = state.tabs.find((t) => t.id === state.activeTabId);
      if (!active || active.forwardStack.length === 0) return state;
      return updateActiveTab(state, (tab) => {
        const next = tab.forwardStack[tab.forwardStack.length - 1];
        return {
          ...tab,
          forwardStack: tab.forwardStack.slice(0, -1),
          backStack: [...tab.backStack, tab.route],
          route: next,
        };
      });
    }

    case "OPEN_TAB": {
      const newTab = createTab(action.route ?? { page: "pods" });
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
      };
    }

    case "CLOSE_TAB": {
      if (state.tabs.length <= 1) {
        const fresh = createTab({ page: "pods" });
        return { tabs: [fresh], activeTabId: fresh.id };
      }
      const idx = state.tabs.findIndex((t) => t.id === action.tabId);
      const newTabs = state.tabs.filter((t) => t.id !== action.tabId);
      let newActiveId = state.activeTabId;
      if (action.tabId === state.activeTabId) {
        const nextIdx = Math.min(idx, newTabs.length - 1);
        newActiveId = newTabs[nextIdx].id;
      }
      return { tabs: newTabs, activeTabId: newActiveId };
    }

    case "SWITCH_TAB":
      return { ...state, activeTabId: action.tabId };

    case "RESET_TABS": {
      const fresh = createTab(action.route);
      return { tabs: [fresh], activeTabId: fresh.id };
    }

    default:
      return state;
  }
}

export function getTabTitle(route: Route): string {
  switch (route.page) {
    case "cluster-select":
      return "Clusters";
    case "pods":
      return "Pods";
    case "pod-detail":
      return route.name;
    case "namespaces":
      return "Namespaces";
    case "namespace-detail":
      return route.name;
    case "nodes":
      return "Nodes";
    case "node-detail":
      return route.name;
    case "deployments":
      return "Deployments";
    case "deployment-detail":
      return route.name;
    case "statefulsets":
      return "StatefulSets";
    case "statefulset-detail":
      return route.name;
    case "daemonsets":
      return "DaemonSets";
    case "daemonset-detail":
      return route.name;
    case "replicasets":
      return "ReplicaSets";
    case "replicaset-detail":
      return route.name;
    case "jobs":
      return "Jobs";
    case "job-detail":
      return route.name;
    case "cronjobs":
      return "CronJobs";
    case "cronjob-detail":
      return route.name;
    case "services":
      return "Services";
    case "service-detail":
      return route.name;
    case "ingresses":
      return "Ingresses";
    case "ingress-detail":
      return route.name;
    case "networkpolicies":
      return "Network Policies";
    case "networkpolicy-detail":
      return route.name;
    case "configmaps":
      return "ConfigMaps";
    case "configmap-detail":
      return route.name;
    case "secrets":
      return "Secrets";
    case "secret-detail":
      return route.name;
    case "pvcs":
      return "PVCs";
    case "pvc-detail":
      return route.name;
    case "persistentvolumes":
      return "PersistentVolumes";
    case "persistentvolume-detail":
      return route.name;
    case "storageclasses":
      return "StorageClasses";
    case "storageclass-detail":
      return route.name;
    case "serviceaccounts":
      return "ServiceAccounts";
    case "serviceaccount-detail":
      return route.name;
    case "roles":
      return "Roles";
    case "role-detail":
      return route.name;
    case "clusterrole-detail":
      return route.name;
    case "rolebindings":
      return "Bindings";
    case "rolebinding-detail":
      return route.name;
    case "clusterrolebinding-detail":
      return route.name;
  }
}

interface NavigationContextValue {
  route: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  tabs: Tab[];
  activeTabId: string;
  switchTab: (tabId: string) => void;
  openTab: (route?: Route) => void;
  closeTab: (tabId: string) => void;
  resetTabs: (route: Route) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
  initial = { page: "cluster-select" },
}: {
  children: React.ReactNode;
  initial?: Route;
}) {
  const [state, dispatch] = useReducer(navReducer, undefined, () => {
    const tab = createTab(initial);
    return { tabs: [tab], activeTabId: tab.id };
  });

  const activeTab = useMemo(
    () => state.tabs.find((t) => t.id === state.activeTabId)!,
    [state],
  );

  const navigate = useCallback((route: Route) => dispatch({ type: "NAVIGATE", route }), []);
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);
  const goForward = useCallback(() => dispatch({ type: "GO_FORWARD" }), []);
  const switchTab = useCallback((tabId: string) => dispatch({ type: "SWITCH_TAB", tabId }), []);
  const openTab = useCallback((route?: Route) => dispatch({ type: "OPEN_TAB", route }), []);
  const closeTab = useCallback((tabId: string) => dispatch({ type: "CLOSE_TAB", tabId }), []);
  const resetTabs = useCallback((route: Route) => dispatch({ type: "RESET_TABS", route }), []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      route: activeTab.route,
      navigate,
      goBack,
      goForward,
      canGoBack: activeTab.backStack.length > 0,
      canGoForward: activeTab.forwardStack.length > 0,
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      switchTab,
      openTab,
      closeTab,
      resetTabs,
    }),
    [activeTab, state.tabs, state.activeTabId, navigate, goBack, goForward, switchTab, openTab, closeTab, resetTabs],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
