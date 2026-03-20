import { useEffect, useState } from "react";
import {
  GetReplicaSetDetail,
  GetReplicaSetEvents,
} from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation } from "@/navigation";

interface ReplicaSetDetailViewProps {
  namespace: string;
  name: string;
}

function replicaSetStatus(rs: kube.ReplicaSetDetail): string {
  if (rs.desired === 0) return "Scaled Down";
  if (rs.ready === rs.desired) return "Ready";
  if (rs.ready < rs.desired) return "Progressing";
  return "Ready";
}

export function ReplicaSetDetailView({
  namespace,
  name,
}: ReplicaSetDetailViewProps) {
  const { goBack, navigate } = useNavigation();
  const [rs, setRs] = useState<kube.ReplicaSetDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [rsDetail, rsEvents] = await Promise.all([
          GetReplicaSetDetail(namespace, name),
          GetReplicaSetEvents(namespace, name),
        ]);
        setRs(rsDetail);
        setEvents(rsEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates — refetch detail when this replicaset changes
  useEffect(() => {
    const cancel = EventsOn(
      "replicasets:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This replicaset has been deleted");
          setRs(null);
          return;
        }

        Promise.all([
          GetReplicaSetDetail(namespace, name),
          GetReplicaSetEvents(namespace, name),
        ])
          .then(([rsDetail, rsEvents]) => {
            setRs(rsDetail);
            setEvents(rsEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading replicaset details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to ReplicaSets
        </Button>
      </div>
    );
  }

  if (!rs) return null;

  const status = replicaSetStatus(rs);

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* ReplicaSet overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {rs.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{rs.namespace}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Desired", value: String(rs.desired) },
              { label: "Current", value: String(rs.current) },
              { label: "Ready", value: String(rs.ready) },
              { label: "Age", value: rs.age },
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
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{rs.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
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
                      className="text-blue-400 hover:underline"
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
      </div>
    </div>
  );
}
