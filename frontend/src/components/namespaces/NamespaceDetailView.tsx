import { useEffect, useState } from "react";
import {
  GetNamespaceDetail,
  GetNamespaceEvents,
  GetNamespaceResourceSummary,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { useNavigation, type Route } from "@/navigation";

interface ResourceCard {
  label: string;
  count: number;
  route: Route;
}

export function NamespaceDetailView({ name }: { name: string }) {
  const { goBack, navigate } = useNavigation();
  const [ns, setNs] = useState<kube.NamespaceDetail | null>(null);
  const [events, setEvents] = useState<kube.EventInfo[]>([]);
  const [summary, setSummary] = useState<kube.NamespaceResourceSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [nsDetail, nsEvents, nsSummary] = await Promise.all([
          GetNamespaceDetail(name),
          GetNamespaceEvents(name),
          GetNamespaceResourceSummary(name),
        ]);
        setNs(nsDetail);
        setEvents(nsEvents || []);
        setSummary(nsSummary);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading namespace details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Namespaces
        </Button>
      </div>
    );
  }

  if (!ns) return null;

  const resourceCards: ResourceCard[] = summary
    ? [
        {
          label: "Pods",
          count: summary.pods,
          route: { page: "pods" },
        },
        {
          label: "Deployments",
          count: summary.deployments,
          route: { page: "deployments" },
        },
        {
          label: "StatefulSets",
          count: summary.statefulSets,
          route: { page: "statefulsets" },
        },
        {
          label: "DaemonSets",
          count: summary.daemonSets,
          route: { page: "daemonsets" },
        },
        {
          label: "Jobs",
          count: summary.jobs,
          route: { page: "jobs" },
        },
        {
          label: "CronJobs",
          count: summary.cronJobs,
          route: { page: "cronjobs" },
        },
        {
          label: "Services",
          count: summary.services,
          route: { page: "services" },
        },
        {
          label: "ConfigMaps",
          count: summary.configMaps,
          route: { page: "configmaps" },
        },
        {
          label: "Secrets",
          count: summary.secrets,
          route: { page: "secrets" },
        },
      ]
    : [];

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Namespace overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-zinc-100 truncate">
              {ns.name}
            </h2>
            <StatusBadge status={ns.status} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Status", value: ns.status },
              { label: "Age", value: ns.age },
              { label: "Created", value: ns.creationTimestamp },
              { label: "UID", value: ns.uid },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-950 rounded-sm px-3 py-2">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mt-0.5 truncate">
                  {s.value || "\u2014"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resource Summary */}
        {summary && (
          <section>
            <SectionHeading>Resources</SectionHeading>
            <div className="grid grid-cols-3 gap-3">
              {resourceCards.map((card) => (
                <button
                  key={card.label}
                  onClick={() => navigate(card.route)}
                  className="bg-zinc-900 rounded-sm px-4 py-3 text-left transition-colors hover:bg-zinc-800/70 cursor-pointer"
                >
                  <div className="text-2xl font-bold text-zinc-100">
                    {card.count}
                  </div>
                  <div className="text-[12px] text-zinc-400 mt-0.5">
                    {card.label}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Labels & Annotations */}
        {((ns.labels && Object.keys(ns.labels).length > 0) ||
          (ns.annotations && Object.keys(ns.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {ns.labels && Object.keys(ns.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={ns.labels} />
              </div>
            )}
            {ns.annotations && Object.keys(ns.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={ns.annotations} />
              </div>
            )}
          </section>
        )}

        {/* Conditions */}
        {ns.conditions && ns.conditions.length > 0 && (
          <section>
            <SectionHeading>Conditions</SectionHeading>
            <ConditionsTable conditions={ns.conditions} />
          </section>
        )}

        {/* Events */}
        <section>
          <SectionHeading>Events ({events.length})</SectionHeading>
          <EventsTable
            events={events}
            emptyMessage="No events found for this namespace."
          />
        </section>
      </div>
    </div>
  );
}
