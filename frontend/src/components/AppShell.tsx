import { Button } from "@/components/ui/button";
import { useCluster } from "@/contexts/ClusterContext";
import { Sidebar } from "@/components/Sidebar";
import { StatusBar } from "@/components/StatusBar";
import { TopBar } from "@/components/TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { error, setError } = useCluster();

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-200 font-sans text-[13px]">
      {/* Top navigation bar */}
      <TopBar />

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

      {/* Global status bar */}
      <StatusBar />
    </div>
  );
}
