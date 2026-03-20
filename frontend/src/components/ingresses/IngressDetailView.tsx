import { useEffect, useState } from "react";
import {
  GetIngressDetail,
  GetIngressEvents,
} from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

interface IngressDetailViewProps {
  namespace: string;
  name: string;
}

export function IngressDetailView({
  namespace,
  name,
}: IngressDetailViewProps) {
  const { goBack } = useNavigation();
  const [ingress, setIngress] = useState<kube.IngressDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [ingDetail, ingEvents] = await Promise.all([
          GetIngressDetail(namespace, name),
          GetIngressEvents(namespace, name),
        ]);
        setIngress(ingDetail);
        setEvents(ingEvents || []);
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
      "ingresses:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This ingress has been deleted");
          setIngress(null);
          return;
        }

        Promise.all([
          GetIngressDetail(namespace, name),
          GetIngressEvents(namespace, name),
        ])
          .then(([ingDetail, ingEvents]) => {
            setIngress(ingDetail);
            setEvents(ingEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading ingress details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Ingresses
        </Button>
      </div>
    );
  }

  if (!ingress) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Ingress overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {ingress.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {ingress.namespace}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
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
                {ingress.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
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
      </div>
    </div>
  );
}
