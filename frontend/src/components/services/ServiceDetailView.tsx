import { useEffect, useState } from "react";
import {
  GetServiceDetail,
  GetServiceEvents,
} from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

interface ServiceDetailViewProps {
  namespace: string;
  name: string;
}

export function ServiceDetailView({
  namespace,
  name,
}: ServiceDetailViewProps) {
  const { goBack } = useNavigation();
  const [service, setService] = useState<kube.ServiceDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [svcDetail, svcEvents] = await Promise.all([
          GetServiceDetail(namespace, name),
          GetServiceEvents(namespace, name),
        ]);
        setService(svcDetail);
        setEvents(svcEvents || []);
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
      "services:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This service has been deleted");
          setService(null);
          return;
        }

        Promise.all([
          GetServiceDetail(namespace, name),
          GetServiceEvents(namespace, name),
        ])
          .then(([svcDetail, svcEvents]) => {
            setService(svcDetail);
            setEvents(svcEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading service details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Services
        </Button>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Service overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {service.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{service.namespace}</p>
            </div>
            <StatusBadge status={service.type} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Type", value: service.type },
              { label: "Cluster IP", value: service.clusterIP },
              { label: "External IP", value: service.externalIP || "None" },
              { label: "Age", value: service.age },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-950 rounded-sm px-3 py-2">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                  {s.value || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <div>
              <span className="text-zinc-500">Session Affinity</span>
              <p className="text-zinc-200">{service.sessionAffinity || "—"}</p>
            </div>
            {service.externalTrafficPolicy && (
              <div>
                <span className="text-zinc-500">External Traffic Policy</span>
                <p className="text-zinc-200">{service.externalTrafficPolicy}</p>
              </div>
            )}
            {service.internalTrafficPolicy && (
              <div>
                <span className="text-zinc-500">Internal Traffic Policy</span>
                <p className="text-zinc-200">{service.internalTrafficPolicy}</p>
              </div>
            )}
            {service.ipFamilyPolicy && (
              <div>
                <span className="text-zinc-500">IP Family Policy</span>
                <p className="text-zinc-200">{service.ipFamilyPolicy}</p>
              </div>
            )}
            {service.ipFamilies && service.ipFamilies.length > 0 && (
              <div>
                <span className="text-zinc-500">IP Families</span>
                <p className="text-zinc-200">{service.ipFamilies.join(", ")}</p>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{service.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {service.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Ports table */}
        {service.ports && service.ports.length > 0 && (
          <section>
            <SectionHeading>Ports ({service.ports.length})</SectionHeading>
            <div className="overflow-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr>
                    {["Name", "Port", "Protocol", "Target Port", "Node Port"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {service.ports.map((p, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                        {p.name || "—"}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {p.port}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                        {p.protocol}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {p.targetPort || "—"}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {p.nodePort || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Selector */}
        {service.selector && Object.keys(service.selector).length > 0 && (
          <section>
            <SectionHeading>Selector</SectionHeading>
            <KeyValueList entries={service.selector} />
          </section>
        )}

        {/* Labels & Annotations */}
        {((service.labels && Object.keys(service.labels).length > 0) ||
          (service.annotations && Object.keys(service.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {service.labels && Object.keys(service.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={service.labels} />
              </div>
            )}
            {service.annotations && Object.keys(service.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={service.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this service."
          />
        </section>
      </div>
    </div>
  );
}
