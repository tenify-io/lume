import { createContext, useContext, useEffect, useState } from "react";
import {
  GetContexts,
  GetCurrentContext,
  ConnectToContext,
  GetNamespaces,
  GetPods,
  GetPreference,
  SetPreference,
  GetContextAliases,
  SetContextAlias,
  UnwatchAll,
} from "../../wailsjs/go/main/App";
import { useNavigation } from "@/navigation";

interface KubeContext {
  name: string;
  cluster: string;
  user: string;
}

interface ClusterContextValue {
  contexts: KubeContext[];
  currentContext: string;
  connected: boolean;
  connecting: boolean;
  connectingContext: string;
  aliases: Record<string, string>;
  namespaces: string[];
  selectedNamespace: string;
  initializing: boolean;
  error: string;
  connectToCluster: (contextName: string) => Promise<void>;
  changeCluster: () => void;
  setSelectedNamespace: (ns: string) => void;
  setError: (error: string) => void;
  handleAliasChange: (contextName: string, alias: string) => Promise<void>;
}

const ClusterContext = createContext<ClusterContextValue | null>(null);

export function ClusterProvider({ children }: { children: React.ReactNode }) {
  const { navigate } = useNavigation();

  const [contexts, setContexts] = useState<KubeContext[]>([]);
  const [currentContext, setCurrentContext] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectingContext, setConnectingContext] = useState("");
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const [initializing, setInitializing] = useState(true);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [ctxs, current, contextAliases, lastContext] = await Promise.all([
          GetContexts(),
          GetCurrentContext(),
          GetContextAliases(),
          GetPreference("last_context"),
        ]);
        setContexts(ctxs);
        setCurrentContext(current);
        setAliases(contextAliases || {});

        const lastCtx = typeof lastContext === "string" ? lastContext : "";
        if (lastCtx && ctxs.some((c: KubeContext) => c.name === lastCtx)) {
          await autoConnect(lastCtx);
        }
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setInitializing(false);
      }
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function autoConnect(contextName: string) {
    setConnecting(true);
    setConnectingContext(contextName);
    try {
      await ConnectToContext(contextName);
      setConnected(true);
      setCurrentContext(contextName);
      const ns = await GetNamespaces();
      setNamespaces(ns);
      setSelectedNamespace("");
      // Pre-fetch pods so the list view has data
      await GetPods("");
      navigate({ page: "pods" });
    } catch (e: unknown) {
      setError(String(e));
      SetPreference("last_context", "").catch(() => {});
      navigate({ page: "cluster-select" });
    } finally {
      setConnecting(false);
      setConnectingContext("");
    }
  }

  async function connectToCluster(contextName: string) {
    setConnecting(true);
    setConnectingContext(contextName);
    setError("");
    try {
      await ConnectToContext(contextName);
      setConnected(true);
      setCurrentContext(contextName);
      await SetPreference("last_context", contextName);
      const ns = await GetNamespaces();
      setNamespaces(ns);
      setSelectedNamespace("");
      navigate({ page: "pods" });
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setConnecting(false);
      setConnectingContext("");
    }
  }

  function changeCluster() {
    UnwatchAll().catch(() => {});
    setConnected(false);
    setNamespaces([]);
    setSelectedNamespace("");
    setError("");
    navigate({ page: "cluster-select" });
  }

  async function handleAliasChange(contextName: string, alias: string) {
    try {
      await SetContextAlias(contextName, alias);
      const updated = await GetContextAliases();
      setAliases(updated || {});
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  return (
    <ClusterContext.Provider
      value={{
        contexts,
        currentContext,
        connected,
        connecting,
        connectingContext,
        aliases,
        namespaces,
        selectedNamespace,
        initializing,
        error,
        connectToCluster,
        changeCluster,
        setSelectedNamespace,
        setError,
        handleAliasChange,
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
}

export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
  return ctx;
}
