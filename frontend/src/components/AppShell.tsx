import lumeLogo from "@/assets/images/lume-logo-light.svg";
import { Button } from "@/components/ui/button";
import { useCluster } from "@/contexts/ClusterContext";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentContext, aliases, error, setError, changeCluster } =
    useCluster();

  const clusterDisplayName = aliases[currentContext] || currentContext;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 font-sans text-[13px]">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-zinc-900">
        <img src={lumeLogo} alt="Lume" className="h-8" />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[13px] text-zinc-300 font-medium">
            {clusterDisplayName}
          </span>
          <Button variant="ghost" size="sm" onClick={changeCluster}>
            Change Cluster
          </Button>
        </div>
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

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
