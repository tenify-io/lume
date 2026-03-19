import { useEffect, useState } from "react";
import lumeLogo from "@/assets/images/lume-logo-light.svg";
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
} from "../wailsjs/go/main/App";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClusterSelectView from "@/components/ClusterSelectView";
import PodDetailView from "@/components/PodDetailView";

interface KubeContext {
  name: string;
  cluster: string;
  user: string;
}

interface ContainerInfo {
  name: string;
  image: string;
  ready: boolean;
  state: string;
}

interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  ready: string;
  restarts: number;
  age: string;
  labels: Record<string, string>;
  nodeName: string;
  ip: string;
  containers: ContainerInfo[];
}

type AppView = "cluster-select" | "dashboard" | "pod-detail";

function App() {
  const [view, setView] = useState<AppView>("cluster-select");
  const [contexts, setContexts] = useState<KubeContext[]>([]);
  const [currentContext, setCurrentContext] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectingContext, setConnectingContext] = useState("");
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const [initializing, setInitializing] = useState(true);

  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPod, setSelectedPod] = useState<{
    namespace: string;
    name: string;
  } | null>(null);

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

      // Auto-connect if we have a remembered context that still exists
      const lastCtx = typeof lastContext === "string" ? lastContext : "";
      if (lastCtx && ctxs.some((c) => c.name === lastCtx)) {
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
      await loadPods("");
      setView("dashboard");
    } catch (e: unknown) {
      setError(String(e));
      // Clear stale last_context so we don't retry on next launch
      SetPreference("last_context", "").catch(() => {});
      setView("cluster-select");
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
      await loadPods("");
      setView("dashboard");
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setConnecting(false);
      setConnectingContext("");
    }
  }

  function changeCluster() {
    setConnected(false);
    setPods([]);
    setNamespaces([]);
    setSelectedNamespace("");
    setSearch("");
    setSelectedPod(null);
    setError("");
    setView("cluster-select");
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

  async function loadPods(namespace: string) {
    setLoading(true);
    setError("");
    try {
      const result = await GetPods(namespace);
      setPods(result || []);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onNamespaceChange(ns: string) {
    setSelectedNamespace(ns);
    await loadPods(ns);
  }

  const filteredPods = pods.filter(
    (pod) =>
      pod.name.toLowerCase().includes(search.toLowerCase()) ||
      pod.namespace.toLowerCase().includes(search.toLowerCase()) ||
      pod.status.toLowerCase().includes(search.toLowerCase())
  );

  function statusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-emerald-950 text-emerald-400";
      case "succeeded":
        return "bg-sky-950 text-sky-400";
      case "pending":
        return "bg-amber-950 text-amber-400";
      case "failed":
        return "bg-red-950 text-red-400";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  }

  const podKey = (pod: PodInfo) => pod.namespace + "/" + pod.name;
  const clusterDisplayName = aliases[currentContext] || currentContext;

  if (initializing) {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 font-sans text-[13px]">
        <header className="flex items-center gap-3 px-6 py-4 bg-zinc-900">
          <img src={lumeLogo} alt="Lume" className="h-8" />
        </header>
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 font-sans text-[13px]">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-zinc-900">
        <img src={lumeLogo} alt="Lume" className="h-8" />
        {connected && (view === "dashboard" || view === "pod-detail") && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[13px] text-zinc-300 font-medium">
              {clusterDisplayName}
            </span>
            <Button variant="ghost" size="sm" onClick={changeCluster}>
              Change Cluster
            </Button>
          </div>
        )}
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between px-6 py-2.5 bg-red-950 text-red-300 text-[13px]">
          <span>{error}</span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setError("")}
            className="border-red-400 text-red-400 hover:bg-red-400/10"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Cluster selection view */}
      {view === "cluster-select" && (
        <ClusterSelectView
          contexts={contexts}
          aliases={aliases}
          onConnect={connectToCluster}
          onAliasChange={handleAliasChange}
          connecting={connecting}
          connectingContext={connectingContext}
        />
      )}

      {/* Dashboard view */}
      {view === "dashboard" && connected && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 items-center px-6 py-3 bg-zinc-900">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Namespace:
              </label>
              <Select
                value={selectedNamespace || "__all__"}
                onValueChange={(val) =>
                  onNamespaceChange(!val || val === "__all__" ? "" : val)
                }
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Namespaces</SelectItem>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                onClick={() => loadPods(selectedNamespace)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>

            <div className="ml-auto">
              <Input
                type="text"
                placeholder="Search pods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[220px] bg-zinc-950"
              />
            </div>
          </div>

          {/* Empty state - no pods */}
          {!loading && filteredPods.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
              <p>No pods found.</p>
            </div>
          )}

          {/* Pod table */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full border-collapse table-auto">
              <thead className="sticky top-0 z-10">
                <tr>
                  {[
                    "Name",
                    "Namespace",
                    "Status",
                    "Ready",
                    "Restarts",
                    "Age",
                    "Node",
                    "IP",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPods.map((pod) => (
                  <tr
                    key={podKey(pod)}
                    className="cursor-pointer transition-colors hover:bg-zinc-900"
                    onClick={() => {
                      setSelectedPod({
                        namespace: pod.namespace,
                        name: pod.name,
                      });
                      setView("pod-detail");
                    }}
                  >
                    <td className="px-3 py-2 border-b border-zinc-900 font-semibold text-zinc-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                      {pod.name}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                      {pod.namespace}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClass(pod.status)}`}
                      >
                        {pod.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                      {pod.ready}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                      {pod.restarts}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                      {pod.age}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap">
                      {pod.nodeName}
                    </td>
                    <td className="px-3 py-2 border-b border-zinc-900 whitespace-nowrap font-mono text-xs">
                      {pod.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-1.5 text-xs text-zinc-600 bg-zinc-900 shrink-0">
            {loading ? "Loading..." : `${filteredPods.length} pod(s)`}
            {search && ` matching "${search}"`}
          </div>
        </>
      )}

      {/* Pod detail view */}
      {view === "pod-detail" && connected && selectedPod && (
        <PodDetailView
          namespace={selectedPod.namespace}
          name={selectedPod.name}
          onBack={() => {
            setSelectedPod(null);
            setView("dashboard");
          }}
        />
      )}
    </div>
  );
}

export default App;
