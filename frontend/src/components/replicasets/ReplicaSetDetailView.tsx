import {
  GetReplicaSetDetail,
  GetReplicaSetEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy, Scaling } from "lucide-react";
import { useNavigation } from "@/navigation";

function replicaSetStatus(rs: kube.ReplicaSetDetail): string {
  if (rs.desired === 0) return "Scaled Down";
  if (rs.ready === rs.desired) return "Ready";
  if (rs.ready < rs.desired) return "Progressing";
  return "Ready";
}

export function ReplicaSetDetailView({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const { navigate } = useNavigation();

  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "scale", label: "Scale", icon: Scaling, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive", group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.ReplicaSetDetail>
      namespace={namespace}
      name={name}
      fetchDetail={() => GetReplicaSetDetail(namespace, name)}
      fetchEvents={() => GetReplicaSetEvents(namespace, name)}
      eventChannel="replicasets:changed"
      resourceLabel="replicaset"
      toolbar={<ResourceToolbar actions={actions} />}
    >
      {(rs, events) => {
        const status = replicaSetStatus(rs);
        return (
          <>
            {/* ReplicaSet overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              {/* Identity */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                    {rs.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{rs.namespace}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Desired", value: String(rs.desired) },
                  { label: "Current", value: String(rs.current) },
                  { label: "Ready", value: String(rs.ready) },
                  { label: "Age", value: rs.age },
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
                  <p className="text-zinc-200">{rs.creationTimestamp || "\u2014"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                  <p className="text-zinc-200 font-mono text-xs truncate">
                    {rs.uid}
                  </p>
                </div>
              </div>
            </section>

            {/* Owner References */}
            {rs.ownerReferences && rs.ownerReferences.length > 0 && (
              <section>
                <SectionHeading>Owner References</SectionHeading>
                <div className="flex flex-col gap-1">
                  {rs.ownerReferences.map((ref, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900 rounded-sm px-4 py-2 text-[13px] flex items-center gap-2"
                    >
                      <span className="text-zinc-500">{ref.kind}:</span>
                      {ref.kind === "Deployment" ? (
                        <button
                          className="text-zinc-200 hover:underline"
                          onClick={() =>
                            navigate({
                              page: "deployment-detail",
                              namespace: namespace,
                              name: ref.name,
                            })
                          }
                        >
                          {ref.name}
                        </button>
                      ) : (
                        <span className="text-zinc-200">{ref.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Selector */}
            {rs.selector && Object.keys(rs.selector).length > 0 && (
              <section>
                <SectionHeading>Selector</SectionHeading>
                <KeyValueList entries={rs.selector} />
              </section>
            )}

            {/* Images */}
            {rs.images && rs.images.length > 0 && (
              <section>
                <SectionHeading>Images ({rs.images.length})</SectionHeading>
                <div className="flex flex-col gap-1">
                  {rs.images.map((img, i) => (
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
            {((rs.labels && Object.keys(rs.labels).length > 0) ||
              (rs.annotations && Object.keys(rs.annotations).length > 0)) && (
              <section className="flex flex-col gap-4">
                {rs.labels && Object.keys(rs.labels).length > 0 && (
                  <div>
                    <SectionHeading>Labels</SectionHeading>
                    <KeyValueList entries={rs.labels} />
                  </div>
                )}
                {rs.annotations && Object.keys(rs.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={rs.annotations} />
                  </div>
                )}
              </section>
            )}

            {/* Conditions */}
            {rs.conditions && rs.conditions.length > 0 && (
              <section>
                <SectionHeading>Conditions</SectionHeading>
                <ConditionsTable conditions={rs.conditions} />
              </section>
            )}

            {/* Events */}
            <section>
              <SectionHeading>Events ({events.length})</SectionHeading>
              <EventsTable
                events={events}
                emptyMessage="No events found for this replicaset."
              />
            </section>
          </>
        );
      }}
    </ResourceDetailView>
  );
}
