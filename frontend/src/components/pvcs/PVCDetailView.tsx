import {
  GetPVCDetail,
  GetPVCEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";

export function PVCDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  return (
    <ResourceDetailView<kube.PVCDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetPVCDetail(namespace, name)}
      fetchEvents={() => GetPVCEvents(namespace, name)}
      eventChannel="pvcs:changed"
      resourceLabel="persistent volume claim"
    >
      {(pvc, events) => (
        <>
          {/* PVC overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {pvc.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">{pvc.namespace}</p>
              </div>
              <StatusBadge status={pvc.status} />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Status", value: pvc.status },
                { label: "Capacity", value: pvc.capacity },
                { label: "Access Modes", value: pvc.accessModes },
                { label: "Age", value: pvc.age },
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
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Storage Class</span>
                <p className="text-zinc-200">{pvc.storageClass || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Volume Mode</span>
                <p className="text-zinc-200">{pvc.volumeMode || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Volume</span>
                <p className="text-zinc-200 font-mono text-xs">
                  {pvc.volume || "\u2014"}
                </p>
              </div>
              {pvc.dataSource && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Data Source</span>
                  <p className="text-zinc-200">{pvc.dataSource}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                <p className="text-zinc-200">
                  {pvc.creationTimestamp || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                <p className="text-zinc-200 font-mono text-xs truncate">
                  {pvc.uid}
                </p>
              </div>
            </div>
          </section>

          {/* Conditions */}
          {pvc.conditions && pvc.conditions.length > 0 && (
            <section>
              <SectionHeading>
                Conditions ({pvc.conditions.length})
              </SectionHeading>
              <div className="overflow-auto">
                <table className="w-full border-collapse table-auto">
                  <thead>
                    <tr>
                      {["Type", "Status", "Last Transition", "Reason", "Message"].map(
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
                    {pvc.conditions.map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-semibold">
                          {c.type}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap text-xs">
                          {c.lastTransitionTime || "\u2014"}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap text-xs">
                          {c.reason || "\u2014"}
                        </td>
                        <td className="px-3 py-2 border-b border-zinc-800/30 text-xs max-w-[400px] truncate">
                          {c.message || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Labels & Annotations */}
          {((pvc.labels && Object.keys(pvc.labels).length > 0) ||
            (pvc.annotations && Object.keys(pvc.annotations).length > 0)) && (
            <section className="flex flex-col gap-4">
              {pvc.labels && Object.keys(pvc.labels).length > 0 && (
                <div>
                  <SectionHeading>Labels</SectionHeading>
                  <KeyValueList entries={pvc.labels} />
                </div>
              )}
              {pvc.annotations && Object.keys(pvc.annotations).length > 0 && (
                <div>
                  <SectionHeading>Annotations</SectionHeading>
                  <KeyValueList entries={pvc.annotations} />
                </div>
              )}
            </section>
          )}

          {/* Events */}
          <section>
            <SectionHeading>Events ({events.length})</SectionHeading>
            <EventsTable
              events={events}
              emptyMessage="No events found for this PVC."
            />
          </section>
        </>
      )}
    </ResourceDetailView>
  );
}
