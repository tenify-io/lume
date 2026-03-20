import {
  GetStatefulSetDetail,
  GetStatefulSetEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";

function statefulSetStatus(ss: kube.StatefulSetDetail): string {
  const parts = ss.ready.split("/");
  const ready = parseInt(parts[0], 10);
  const desired = parseInt(parts[1], 10);
  if (desired === 0) return "Scaled Down";
  if (ready === desired) return "Ready";
  if (ready < desired) return "Progressing";
  return "Ready";
}

export function StatefulSetDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  return (
    <ResourceDetailView<kube.StatefulSetDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetStatefulSetDetail(namespace, name)}
      fetchEvents={() => GetStatefulSetEvents(namespace, name)}
      eventChannel="statefulsets:changed"
      resourceLabel="statefulset"
    >
      {(ss, events) => {
        const status = statefulSetStatus(ss);
        return (
          <>
            {/* StatefulSet overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              {/* Identity */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                    {ss.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{ss.namespace}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Ready", value: ss.ready },
                  { label: "Current", value: String(ss.currentReplicas) },
                  { label: "Updated", value: String(ss.updatedReplicas) },
                  { label: "Age", value: ss.age },
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
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Update Strategy</span>
                  <p className="text-zinc-200">{ss.updateStrategy || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Pod Management Policy</span>
                  <p className="text-zinc-200">{ss.podManagementPolicy || "\u2014"}</p>
                </div>
                {ss.updateStrategy === "RollingUpdate" && ss.partition != null && (
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium">Partition</span>
                    <p className="text-zinc-200">{String(ss.partition)}</p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Service Name</span>
                  <p className="text-zinc-200">{ss.serviceName || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Min Ready Seconds</span>
                  <p className="text-zinc-200">{ss.minReadySeconds}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Revision History Limit</span>
                  <p className="text-zinc-200">
                    {ss.revisionHistoryLimit != null
                      ? String(ss.revisionHistoryLimit)
                      : "\u2014"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                  <p className="text-zinc-200">{ss.creationTimestamp || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                  <p className="text-zinc-200 font-mono text-xs truncate">
                    {ss.uid}
                  </p>
                </div>
              </div>
            </section>

            {/* Selector */}
            {ss.selector && Object.keys(ss.selector).length > 0 && (
              <section>
                <SectionHeading>Selector</SectionHeading>
                <KeyValueList entries={ss.selector} />
              </section>
            )}

            {/* Volume Claim Templates */}
            {ss.volumeClaimTemplates && ss.volumeClaimTemplates.length > 0 && (
              <section>
                <SectionHeading>
                  Volume Claim Templates ({ss.volumeClaimTemplates.length})
                </SectionHeading>
                <div className="flex flex-col gap-2">
                  {ss.volumeClaimTemplates.map((vct, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 rounded-sm px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[13px]"
                    >
                      <div>
                        <span className="text-zinc-500">Name</span>
                        <p className="text-zinc-200 font-semibold">{vct.name}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Storage Class</span>
                        <p className="text-zinc-200">{vct.storageClass || "\u2014"}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Access Modes</span>
                        <p className="text-zinc-200">
                          {vct.accessModes?.join(", ") || "\u2014"}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Storage</span>
                        <p className="text-zinc-200">{vct.storage || "\u2014"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Images */}
            {ss.images && ss.images.length > 0 && (
              <section>
                <SectionHeading>Images ({ss.images.length})</SectionHeading>
                <div className="flex flex-col gap-1">
                  {ss.images.map((img, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 rounded-sm px-4 py-2 font-mono text-xs text-zinc-300"
                    >
                      {img}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Labels & Annotations */}
            {((ss.labels && Object.keys(ss.labels).length > 0) ||
              (ss.annotations && Object.keys(ss.annotations).length > 0)) && (
              <section className="flex flex-col gap-4">
                {ss.labels && Object.keys(ss.labels).length > 0 && (
                  <div>
                    <SectionHeading>Labels</SectionHeading>
                    <KeyValueList entries={ss.labels} />
                  </div>
                )}
                {ss.annotations && Object.keys(ss.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={ss.annotations} />
                  </div>
                )}
              </section>
            )}

            {/* Conditions */}
            {ss.conditions && ss.conditions.length > 0 && (
              <section>
                <SectionHeading>Conditions</SectionHeading>
                <ConditionsTable conditions={ss.conditions} />
              </section>
            )}

            {/* Events */}
            <section>
              <SectionHeading>Events ({events.length})</SectionHeading>
              <EventsTable
                events={events}
                emptyMessage="No events found for this statefulset."
              />
            </section>
          </>
        );
      }}
    </ResourceDetailView>
  );
}
