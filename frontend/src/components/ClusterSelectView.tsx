import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KubeContext {
  name: string;
  cluster: string;
  user: string;
}

interface ClusterSelectViewProps {
  contexts: KubeContext[];
  aliases: Record<string, string>;
  onConnect: (contextName: string) => void;
  onAliasChange: (contextName: string, alias: string) => void;
  connecting: boolean;
  connectingContext: string;
}

function ClusterSelectView({
  contexts,
  aliases,
  onConnect,
  onAliasChange,
  connecting,
  connectingContext,
}: ClusterSelectViewProps) {
  const [search, setSearch] = useState("");
  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingContext && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingContext]);

  const filteredContexts = contexts.filter((ctx) => {
    const term = search.toLowerCase();
    const alias = aliases[ctx.name] || "";
    return (
      ctx.name.toLowerCase().includes(term) ||
      alias.toLowerCase().includes(term) ||
      ctx.cluster.toLowerCase().includes(term) ||
      ctx.user.toLowerCase().includes(term)
    );
  });

  function startEditing(contextName: string) {
    setEditingContext(contextName);
    setEditValue(aliases[contextName] || "");
  }

  function saveAlias() {
    if (editingContext !== null) {
      onAliasChange(editingContext, editValue.trim());
      setEditingContext(null);
    }
  }

  function cancelEditing() {
    setEditingContext(null);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-200 mb-1">
            Select a Cluster
          </h2>
          <p className="text-[13px] text-zinc-500">
            Choose a Kubernetes context to connect to.
          </p>
        </div>

        {contexts.length > 0 && (
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Filter clusters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm bg-zinc-950"
            />
          </div>
        )}

        {contexts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600 gap-3">
            <div className="text-5xl opacity-30">&#9781;</div>
            <p>No Kubernetes contexts found. Check your kubeconfig.</p>
          </div>
        )}

        {contexts.length > 0 && filteredContexts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <p>No clusters match &ldquo;{search}&rdquo;</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredContexts.map((ctx) => {
            const alias = aliases[ctx.name];
            const displayName = alias || ctx.name;
            const isConnecting =
              connecting && connectingContext === ctx.name;
            const isEditing = editingContext === ctx.name;

            return (
              <div
                key={ctx.name}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!isEditing && !connecting) {
                    onConnect(ctx.name);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isEditing && !connecting) {
                    onConnect(ctx.name);
                  }
                }}
                className={`group relative flex flex-col gap-2 rounded-sm p-4 transition-colors cursor-pointer ${
                  isConnecting
                    ? "bg-zinc-900 ring-1 ring-green-500"
                    : "bg-zinc-900 hover:bg-zinc-800"
                } ${connecting && !isConnecting ? "opacity-50 pointer-events-none" : ""}`}
              >
                {/* Display name + edit */}
                <div className="flex items-center gap-2 min-w-0">
                  {isEditing ? (
                    <Input
                      ref={editInputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") saveAlias();
                        if (e.key === "Escape") cancelEditing();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={saveAlias}
                      placeholder="Enter alias..."
                      className="h-7 text-sm bg-zinc-950"
                    />
                  ) : (
                    <>
                      <span className="font-semibold text-zinc-200 truncate">
                        {displayName}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(ctx.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 shrink-0"
                        aria-label={`Edit alias for ${ctx.name}`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                    </>
                  )}
                </div>

                {/* Real context name when alias is set */}
                {alias && !isEditing && (
                  <span className="text-[11px] text-zinc-500 truncate">
                    {ctx.name}
                  </span>
                )}

                {/* Cluster and user info */}
                <div className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
                  <span className="truncate">
                    <span className="text-zinc-600">cluster:</span>{" "}
                    {ctx.cluster}
                  </span>
                  <span className="truncate">
                    <span className="text-zinc-600">user:</span> {ctx.user}
                  </span>
                </div>

                {/* Connecting indicator */}
                {isConnecting && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-zinc-900/80">
                    <span className="text-[13px] text-emerald-400 font-medium">
                      Connecting...
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ClusterSelectView;
