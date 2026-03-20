import {
  GetServiceDetail,
  GetServiceEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

export function ServiceDetailView({
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
    <ResourceDetailView<kube.ServiceDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      namespace={namespace}
      name={name}
      fetchDetail={() => GetServiceDetail(namespace, name)}
      fetchEvents={() => GetServiceEvents(namespace, name)}
      eventChannel="services:changed"
      resourceLabel="service"
    >
      {(service, events) => (
        <>
          {/* Service overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {service.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">{service.namespace}</p>
              </div>
              <StatusBadge status={service.type} />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Type", value: service.type },
                { label: "Cluster IP", value: service.clusterIP },
                { label: "External IP", value: service.externalIP || "None" },
                { label: "Age", value: service.age },
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
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Session Affinity</span>
                <p className="text-zinc-200">{service.sessionAffinity || "\u2014"}</p>
              </div>
              {service.externalTrafficPolicy && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">External Traffic Policy</span>
                  <p className="text-zinc-200">{service.externalTrafficPolicy}</p>
                </div>
              )}
              {service.internalTrafficPolicy && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Internal Traffic Policy</span>
                  <p className="text-zinc-200">{service.internalTrafficPolicy}</p>
                </div>
              )}
              {service.ipFamilyPolicy && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">IP Family Policy</span>
                  <p className="text-zinc-200">{service.ipFamilyPolicy}</p>
                </div>
              )}
              {service.ipFamilies && service.ipFamilies.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">IP Families</span>
                  <p className="text-zinc-200">{service.ipFamilies.join(", ")}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                <p className="text-zinc-200">{service.creationTimestamp || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
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
                          {p.name || "\u2014"}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                          {p.port}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                          {p.protocol}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                          {p.targetPort || "\u2014"}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                          {p.nodePort || "\u2014"}
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
        </>
      )}
    </ResourceDetailView>
  );
}
