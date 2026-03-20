import {
  GetIngressDetail,
  GetIngressEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

export function IngressDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const, group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.IngressDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      namespace={namespace}
      name={name}
      fetchDetail={() => GetIngressDetail(namespace, name)}
      fetchEvents={() => GetIngressEvents(namespace, name)}
      eventChannel="ingresses:changed"
      resourceLabel="ingress"
    >
      {(ingress, events) => (
        <>
          {/* Ingress overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {ingress.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {ingress.namespace}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Class", value: ingress.ingressClassName || "None" },
                {
                  label: "Default Backend",
                  value: ingress.defaultBackend || "None",
                },
                {
                  label: "TLS",
                  value:
                    ingress.tls && ingress.tls.length > 0
                      ? `${ingress.tls.length} certificate(s)`
                      : "None",
                },
                { label: "Age", value: ingress.age },
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
                  {ingress.creationTimestamp || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                <p className="text-zinc-200 font-mono text-xs truncate">
                  {ingress.uid}
                </p>
              </div>
            </div>
          </section>

          {/* Rules */}
          {ingress.rules && ingress.rules.length > 0 && (
            <section>
              <SectionHeading>Rules ({ingress.rules.length})</SectionHeading>
              <div className="flex flex-col gap-4">
                {ingress.rules.map((rule, ri) => (
                  <div key={ri} className="bg-zinc-900 rounded-sm px-4 py-3">
                    <div className="text-sm font-semibold text-zinc-200 mb-2">
                      {rule.host || "*"}
                    </div>
                    {rule.paths && rule.paths.length > 0 && (
                      <table className="w-full border-collapse table-auto">
                        <thead>
                          <tr>
                            {["Path", "Path Type", "Backend"].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-950 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rule.paths.map((p, pi) => (
                            <tr key={pi}>
                              <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                {p.path || "/"}
                              </td>
                              <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                                {p.pathType || "\u2014"}
                              </td>
                              <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                {p.backend || "\u2014"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TLS */}
          {ingress.tls && ingress.tls.length > 0 && (
            <section>
              <SectionHeading>TLS ({ingress.tls.length})</SectionHeading>
              <div className="overflow-auto">
                <table className="w-full border-collapse table-auto">
                  <thead>
                    <tr>
                      {["Hosts", "Secret Name"].map((h) => (
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
                    {ingress.tls.map((t, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                          {t.hosts ? t.hosts.join(", ") : "\u2014"}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                          {t.secretName || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Labels & Annotations */}
          {((ingress.labels && Object.keys(ingress.labels).length > 0) ||
            (ingress.annotations &&
              Object.keys(ingress.annotations).length > 0)) && (
            <section className="flex flex-col gap-4">
              {ingress.labels && Object.keys(ingress.labels).length > 0 && (
                <div>
                  <SectionHeading>Labels</SectionHeading>
                  <KeyValueList entries={ingress.labels} />
                </div>
              )}
              {ingress.annotations &&
                Object.keys(ingress.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={ingress.annotations} />
                  </div>
                )}
            </section>
          )}

          {/* Events */}
          <section>
            <SectionHeading>Events ({events.length})</SectionHeading>
            <EventsTable
              events={events}
              emptyMessage="No events found for this ingress."
            />
          </section>
        </>
      )}
    </ResourceDetailView>
  );
}
