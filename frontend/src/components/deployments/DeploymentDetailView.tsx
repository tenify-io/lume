import { useEffect, useState } from "react";
import {
  GetDeploymentDetail,
  GetDeploymentEvents,
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

interface DeploymentDetailViewProps {
  namespace: string;
  name: string;
}

function deploymentStatus(dep: kube.DeploymentDetail): string {
  const parts = dep.ready.split("/");
  const ready = parseInt(parts[0], 10);
  const desired = parseInt(parts[1], 10);
  if (desired === 0) return "Scaled Down";
  if (ready === desired && dep.available === desired) return "Available";
  if (ready < desired) return "Progressing";
  return "Available";
}

export function DeploymentDetailView({
  namespace,
  name,
}: DeploymentDetailViewProps) {
  const { goBack } = useNavigation();
  const [dep, setDep] = useState<kube.DeploymentDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [depDetail, depEvents] = await Promise.all([
          GetDeploymentDetail(namespace, name),
          GetDeploymentEvents(namespace, name),
        ]);
        setDep(depDetail);
        setEvents(depEvents || []);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates — refetch detail when this deployment changes
  useEffect(() => {
    const cancel = EventsOn(
      "deployments:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This deployment has been deleted");
          setDep(null);
          return;
        }

        Promise.all([
          GetDeploymentDetail(namespace, name),
          GetDeploymentEvents(namespace, name),
        ])
          .then(([depDetail, depEvents]) => {
            setDep(depDetail);
            setEvents(depEvents || []);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading deployment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Deployments
        </Button>
      </div>
    );
  }

  if (!dep) return null;

  const status = deploymentStatus(dep);

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Deployment overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {dep.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{dep.namespace}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Ready", value: dep.ready },
              { label: "Up-to-Date", value: String(dep.upToDate) },
              { label: "Available", value: String(dep.available) },
              { label: "Age", value: dep.age },
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
              <span className="text-zinc-500">Strategy</span>
              <p className="text-zinc-200">{dep.strategy || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Min Ready Seconds</span>
              <p className="text-zinc-200">{dep.minReadySeconds}</p>
            </div>
            {dep.strategy === "RollingUpdate" && (
              <>
                <div>
                  <span className="text-zinc-500">Max Surge</span>
                  <p className="text-zinc-200">{dep.maxSurge || "—"}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Max Unavailable</span>
                  <p className="text-zinc-200">{dep.maxUnavailable || "—"}</p>
                </div>
              </>
            )}
            <div>
              <span className="text-zinc-500">Revision History Limit</span>
              <p className="text-zinc-200">
                {dep.revisionHistoryLimit != null
                  ? String(dep.revisionHistoryLimit)
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">{dep.creationTimestamp || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {dep.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Selector */}
        {dep.selector && Object.keys(dep.selector).length > 0 && (
          <section>
            <SectionHeading>Selector</SectionHeading>
            <KeyValueList entries={dep.selector} />
          </section>
        )}

        {/* Images */}
        {dep.images && dep.images.length > 0 && (
          <section>
            <SectionHeading>Images ({dep.images.length})</SectionHeading>
            <div className="flex flex-col gap-1">
              {dep.images.map((img, i) => (
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
        {((dep.labels && Object.keys(dep.labels).length > 0) ||
          (dep.annotations && Object.keys(dep.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {dep.labels && Object.keys(dep.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={dep.labels} />
              </div>
            )}
            {dep.annotations && Object.keys(dep.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={dep.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Conditions */}
        {dep.conditions && dep.conditions.length > 0 && (
          <section>
            <SectionHeading>Conditions</SectionHeading>
            <ConditionsTable conditions={dep.conditions} />
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this deployment."
          />
        </section>
      </div>
    </div>
  );
}
