import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { GetClusterHealth } from "../../wailsjs/go/main/App";
import { useCluster } from "@/contexts/ClusterContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ClusterHealth {
  connected: boolean;
  latencyMs: number;
  serverVersion: string;
  error: string;
}

export function StatusBar() {
  const {
    currentContext,
    contexts,
    aliases,
    selectedNamespace,
    connecting,
    connectingContext,
    connectToCluster,
    changeCluster,
  } = useCluster();
  const [health, setHealth] = useState<ClusterHealth | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    GetClusterHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cancel = EventsOn("cluster:health", (data: ClusterHealth) => {
      setHealth(data);
    });
    return cancel;
  }, []);

  const clusterDisplayName = aliases[currentContext] || currentContext;
  const connected = health?.connected ?? true;
  const latencyHigh = (health?.latencyMs ?? 0) > 500;

  const dotColor = !connected
    ? "bg-red-400"
    : latencyHigh
      ? "bg-amber-400"
      : "bg-emerald-400";

  return (
    <div className="flex items-center px-4 h-7 text-xs text-zinc-500 bg-zinc-950 border-t border-zinc-800/50 shrink-0 gap-4">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {!connected ? (
          <span className="flex items-center gap-1 text-red-400">
            <AlertTriangle size={11} />
            Reconnecting...
          </span>
        ) : (
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                  {clusterDisplayName}
                  <ChevronDown size={10} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-64 p-1 bg-zinc-900 border-zinc-800 text-[12px]"
              >
                {contexts.slice(0, 5).map((ctx) => {
                  const display = aliases[ctx.name] || ctx.name;
                  const isCurrent = ctx.name === currentContext;
                  const isConnecting =
                    connecting && connectingContext === ctx.name;
                  return (
                    <button
                      key={ctx.name}
                      disabled={isCurrent || connecting}
                      onClick={() => {
                        setOpen(false);
                        connectToCluster(ctx.name);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-sm flex items-center gap-2 transition-colors ${
                        isCurrent
                          ? "text-zinc-200 bg-zinc-800"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-50"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${isCurrent ? "bg-emerald-400" : "bg-transparent"}`}
                      />
                      <span className="truncate flex-1">{display}</span>
                      {isConnecting && (
                        <Loader2 size={11} className="animate-spin shrink-0" />
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setOpen(false);
                    changeCluster();
                  }}
                  className="w-full text-left px-2.5 py-1.5 mt-0.5 rounded-sm text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors border-t border-zinc-800"
                >
                  View all clusters...
                </button>
              </PopoverContent>
            </Popover>
            {health?.serverVersion && (
              <span className="text-zinc-600">{health.serverVersion}</span>
            )}
          </>
        )}
      </div>
      <div className="flex-1 text-center text-zinc-600">
        {selectedNamespace || "All Namespaces"}
      </div>
      <div className="text-zinc-600">
        {health && connected && `${health.latencyMs}ms`}
      </div>
    </div>
  );
}
