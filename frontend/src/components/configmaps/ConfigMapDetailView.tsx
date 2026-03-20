import { useState } from "react";
import { GetConfigMapDetail } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ChevronRight } from "lucide-react";

export function ConfigMapDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  function toggleKey(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <ResourceDetailView<kube.ConfigMapDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetConfigMapDetail(namespace, name)}
      eventChannel="configmaps:changed"
      resourceLabel="config map"
    >
      {(configmap) => {
        const dataKeys = configmap.data ? Object.keys(configmap.data).sort() : [];

        return (
          <>
            {/* ConfigMap overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              {/* Identity */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                    {configmap.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {configmap.namespace}
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Data Keys",
                    value: String(dataKeys.length),
                  },
                  {
                    label: "Binary Keys",
                    value: String(
                      configmap.binaryDataKeys
                        ? configmap.binaryDataKeys.length
                        : 0,
                    ),
                  },
                  { label: "Age", value: configmap.age },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-950 rounded-sm px-4 py-3">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {s.label}
                    </div>
                    <div className="text-lg font-bold text-zinc-200 mt-0.5">
                      {s.value || "\u2014"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13px]">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                  <p className="text-zinc-200">
                    {configmap.creationTimestamp || "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                  <p className="text-zinc-200 font-mono text-xs truncate">
                    {configmap.uid}
                  </p>
                </div>
              </div>
            </section>

            {/* Data */}
            <section>
              <SectionHeading>Data ({dataKeys.length})</SectionHeading>
              {dataKeys.length === 0 ? (
                <p className="text-zinc-500 text-sm px-1">No data entries.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {dataKeys.map((key) => {
                    const isExpanded = expandedKeys.has(key);
                    return (
                      <div key={key} className="bg-zinc-900 rounded-sm">
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800/50 transition-colors"
                          onClick={() => toggleKey(key)}
                        >
                          <ChevronRight
                            size={14}
                            className={`shrink-0 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                          <span className="font-mono text-xs font-semibold">
                            {key}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3">
                            <pre className="bg-zinc-950 rounded-sm px-3 py-2 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">
                              {configmap.data[key]}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Binary Data */}
            {configmap.binaryDataKeys && configmap.binaryDataKeys.length > 0 && (
              <section>
                <SectionHeading>
                  Binary Data ({configmap.binaryDataKeys.length})
                </SectionHeading>
                <div className="flex flex-col gap-1">
                  {configmap.binaryDataKeys.map((bk) => (
                    <div
                      key={bk.name}
                      className="bg-zinc-900 rounded-sm px-4 py-2.5 text-sm text-zinc-200"
                    >
                      <span className="font-mono text-xs font-semibold">
                        {bk.name}
                      </span>
                      <span className="text-zinc-500 text-xs ml-2">
                        ({bk.size} bytes)
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Labels & Annotations */}
            {((configmap.labels && Object.keys(configmap.labels).length > 0) ||
              (configmap.annotations &&
                Object.keys(configmap.annotations).length > 0)) && (
              <section className="flex flex-col gap-4">
                {configmap.labels &&
                  Object.keys(configmap.labels).length > 0 && (
                    <div>
                      <SectionHeading>Labels</SectionHeading>
                      <KeyValueList entries={configmap.labels} />
                    </div>
                  )}
                {configmap.annotations &&
                  Object.keys(configmap.annotations).length > 0 && (
                    <div>
                      <SectionHeading>Annotations</SectionHeading>
                      <KeyValueList entries={configmap.annotations} />
                    </div>
                  )}
              </section>
            )}
          </>
        );
      }}
    </ResourceDetailView>
  );
}
