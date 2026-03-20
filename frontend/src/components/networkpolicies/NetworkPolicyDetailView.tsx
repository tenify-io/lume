import { useEffect, useState } from "react";
import { GetNetworkPolicyDetail } from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { useNavigation } from "@/navigation";

interface NetworkPolicyDetailViewProps {
  namespace: string;
  name: string;
}

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
}: NetworkPolicyDetailViewProps) {
  const { goBack } = useNavigation();
  const [policy, setPolicy] = useState<kube.NetworkPolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const detail = await GetNetworkPolicyDetail(namespace, name);
        setPolicy(detail);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates
  useEffect(() => {
    const cancel = EventsOn(
      "networkpolicies:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This network policy has been deleted");
          setPolicy(null);
          return;
        }

        GetNetworkPolicyDetail(namespace, name)
          .then((detail) => {
            setPolicy(detail);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading network policy details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Network Policies
        </Button>
      </div>
    );
  }

  if (!policy) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Network Policy overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {policy.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {policy.namespace}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
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
              <div key={s.label} className="bg-zinc-950 rounded-sm px-3 py-2">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                  {s.value || "\u2014"}
                </div>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">
                {policy.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
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
      </div>
    </div>
  );
}
