import { useEffect, useState } from "react";
import {
  GetNamespaceDetail,
  GetNamespaceEvents,
  GetNamespaceResourceSummary,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ConditionsTable } from "@/components/shared/ConditionsTable";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";
import { useNavigation, type Route } from "@/navigation";

interface ResourceCard {
  label: string;
  count: number;
  route: Route;
}

export function NamespaceDetailView({ name }: { name: string }) {
  const { navigate } = useNavigation();
  const [summary, setSummary] = useState<kube.NamespaceResourceSummary | null>(
    null,
  );

  useEffect(() => {
    GetNamespaceResourceSummary(name)
      .then((s) => setSummary(s))
      .catch(() => {});
  }, [name]);

  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const, group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.NamespaceDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      name={name}
      fetchDetail={() => GetNamespaceDetail(name)}
      fetchEvents={() => GetNamespaceEvents(name)}
      eventChannel="namespaces:changed"
      resourceLabel="namespace"
    >
      {(ns, events) => {
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
          <>
            {/* Namespace overview */}
            <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {ns.name}
                </h2>
                <StatusBadge status={ns.status} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Status", value: ns.status },
                  { label: "Age", value: ns.age },
                  { label: "Created", value: ns.creationTimestamp },
                  { label: "UID", value: ns.uid },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-950 rounded-sm px-4 py-3">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {s.label}
                    </div>
                    <div className="text-lg font-bold text-zinc-200 mt-0.5 truncate">
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
          </>
        );
      }}
    </ResourceDetailView>
  );
}
