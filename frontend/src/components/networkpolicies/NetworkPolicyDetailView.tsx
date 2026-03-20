import { GetNetworkPolicyDetail } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

function formatPeerSelector(
  selector: Record<string, string> | null | undefined,
): string {
  if (!selector || Object.keys(selector).length === 0) return "(all)";
  return Object.entries(selector)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
}

export function NetworkPolicyDetailView({
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
    <ResourceDetailView<kube.NetworkPolicyDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      namespace={namespace}
      name={name}
      fetchDetail={() => GetNetworkPolicyDetail(namespace, name)}
      eventChannel="networkpolicies:changed"
      resourceLabel="network policy"
    >
      {(policy) => (
        <>
          {/* Network Policy overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {policy.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {policy.namespace}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Pod Selector",
                  value:
                    policy.podSelector &&
                    Object.keys(policy.podSelector).length > 0
                      ? formatPeerSelector(policy.podSelector)
                      : "(all pods)",
                },
                {
                  label: "Policy Types",
                  value:
                    policy.policyTypes && policy.policyTypes.length > 0
                      ? policy.policyTypes.join(", ")
                      : "None",
                },
                { label: "Age", value: policy.age },
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
                  {policy.creationTimestamp || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                <p className="text-zinc-200 font-mono text-xs truncate">
                  {policy.uid}
                </p>
              </div>
            </div>
          </section>

          {/* Ingress Rules */}
          <section>
            <SectionHeading>
              Ingress Rules (
              {policy.ingressRules ? policy.ingressRules.length : 0})
            </SectionHeading>
            {!policy.ingressRules || policy.ingressRules.length === 0 ? (
              <p className="text-zinc-500 text-sm px-1">
                No ingress rules defined.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {policy.ingressRules.map((rule, ri) => (
                  <div key={ri} className="bg-zinc-900 rounded-sm px-4 py-3">
                    <div className="text-sm font-semibold text-zinc-200 mb-2">
                      Rule {ri + 1}
                    </div>

                    {/* Ports */}
                    {rule.ports && rule.ports.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                          Ports
                        </div>
                        <table className="w-full border-collapse table-auto">
                          <thead>
                            <tr>
                              {["Protocol", "Port"].map((h) => (
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
                            {rule.ports.map((p, pi) => (
                              <tr key={pi}>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                                  {p.protocol}
                                </td>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {p.port || "(all)"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* From peers */}
                    {rule.from && rule.from.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                          From
                        </div>
                        <table className="w-full border-collapse table-auto">
                          <thead>
                            <tr>
                              {[
                                "Pod Selector",
                                "Namespace Selector",
                                "IP Block",
                              ].map((h) => (
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
                            {rule.from.map((peer, pi) => (
                              <tr key={pi}>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {peer.podSelector
                                    ? formatPeerSelector(peer.podSelector)
                                    : "\u2014"}
                                </td>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {peer.namespaceSelector
                                    ? formatPeerSelector(peer.namespaceSelector)
                                    : "\u2014"}
                                </td>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {peer.ipBlock || "\u2014"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(!rule.from || rule.from.length === 0) &&
                      (!rule.ports || rule.ports.length === 0) && (
                        <p className="text-zinc-500 text-sm">
                          Allow all ingress traffic
                        </p>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Egress Rules */}
          <section>
            <SectionHeading>
              Egress Rules ({policy.egressRules ? policy.egressRules.length : 0})
            </SectionHeading>
            {!policy.egressRules || policy.egressRules.length === 0 ? (
              <p className="text-zinc-500 text-sm px-1">
                No egress rules defined.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {policy.egressRules.map((rule, ri) => (
                  <div key={ri} className="bg-zinc-900 rounded-sm px-4 py-3">
                    <div className="text-sm font-semibold text-zinc-200 mb-2">
                      Rule {ri + 1}
                    </div>

                    {/* Ports */}
                    {rule.ports && rule.ports.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                          Ports
                        </div>
                        <table className="w-full border-collapse table-auto">
                          <thead>
                            <tr>
                              {["Protocol", "Port"].map((h) => (
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
                            {rule.ports.map((p, pi) => (
                              <tr key={pi}>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                                  {p.protocol}
                                </td>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {p.port || "(all)"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* To peers */}
                    {rule.to && rule.to.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                          To
                        </div>
                        <table className="w-full border-collapse table-auto">
                          <thead>
                            <tr>
                              {[
                                "Pod Selector",
                                "Namespace Selector",
                                "IP Block",
                              ].map((h) => (
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
                            {rule.to.map((peer, pi) => (
                              <tr key={pi}>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {peer.podSelector
                                    ? formatPeerSelector(peer.podSelector)
                                    : "\u2014"}
                                </td>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {peer.namespaceSelector
                                    ? formatPeerSelector(peer.namespaceSelector)
                                    : "\u2014"}
                                </td>
                                <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                                  {peer.ipBlock || "\u2014"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(!rule.to || rule.to.length === 0) &&
                      (!rule.ports || rule.ports.length === 0) && (
                        <p className="text-zinc-500 text-sm">
                          Allow all egress traffic
                        </p>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Labels & Annotations */}
          {((policy.labels && Object.keys(policy.labels).length > 0) ||
            (policy.annotations &&
              Object.keys(policy.annotations).length > 0)) && (
            <section className="flex flex-col gap-4">
              {policy.labels && Object.keys(policy.labels).length > 0 && (
                <div>
                  <SectionHeading>Labels</SectionHeading>
                  <KeyValueList entries={policy.labels} />
                </div>
              )}
              {policy.annotations &&
                Object.keys(policy.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={policy.annotations} />
                  </div>
                )}
            </section>
          )}
        </>
      )}
    </ResourceDetailView>
  );
}
