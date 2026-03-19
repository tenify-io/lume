import { useEffect, useState } from "react";
import {
  GetStatefulSetDetail,
  GetStatefulSetEvents,
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

interface StatefulSetDetailViewProps {
  namespace: string;
  name: string;
}

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
}: StatefulSetDetailViewProps) {
  const { goBack } = useNavigation();
  const [ss, setSs] = useState<kube.StatefulSetDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [ssDetail, ssEvents] = await Promise.all([
          GetStatefulSetDetail(namespace, name),
          GetStatefulSetEvents(namespace, name),
        ]);
        setSs(ssDetail);
        setEvents(ssEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates — refetch detail when this statefulset changes
  useEffect(() => {
    const cancel = EventsOn(
      "statefulsets:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This statefulset has been deleted");
          setSs(null);
          return;
        }

        Promise.all([
          GetStatefulSetDetail(namespace, name),
          GetStatefulSetEvents(namespace, name),
        ])
          .then(([ssDetail, ssEvents]) => {
            setSs(ssDetail);
            setEvents(ssEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading statefulset details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to StatefulSets
        </Button>
      </div>
    );
  }

  if (!ss) return null;

  const status = statefulSetStatus(ss);

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* StatefulSet overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {ss.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{ss.namespace}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Ready", value: ss.ready },
              { label: "Current", value: String(ss.currentReplicas) },
              { label: "Updated", value: String(ss.updatedReplicas) },
              { label: "Age", value: ss.age },
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
              <span className="text-zinc-500">Update Strategy</span>
              <p className="text-zinc-200">{ss.updateStrategy || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Pod Management Policy</span>
              <p className="text-zinc-200">{ss.podManagementPolicy || "—"}</p>
            </div>
            {ss.updateStrategy === "RollingUpdate" && ss.partition != null && (
              <div>
                <span className="text-zinc-500">Partition</span>
                <p className="text-zinc-200">{String(ss.partition)}</p>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Service Name</span>
              <p className="text-zinc-200">{ss.serviceName || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Min Ready Seconds</span>
              <p className="text-zinc-200">{ss.minReadySeconds}</p>
            </div>
            <div>
              <span className="text-zinc-500">Revision History Limit</span>
              <p className="text-zinc-200">
                {ss.revisionHistoryLimit != null
                  ? String(ss.revisionHistoryLimit)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{ss.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
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
                    <p className="text-zinc-200">{vct.storageClass || "—"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Access Modes</span>
                    <p className="text-zinc-200">
                      {vct.accessModes?.join(", ") || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Storage</span>
                    <p className="text-zinc-200">{vct.storage || "—"}</p>
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
      </div>
    </div>
  );
}
