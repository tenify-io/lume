import {
  GetPersistentVolumeDetail,
  GetPersistentVolumeEvents,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { EventsTable } from "@/components/shared/EventsTable";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

export function PersistentVolumeDetailView({ name }: { name: string }) {
  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const, group: "danger" },
  ];

  return (
    <ResourceDetailView<kube.PersistentVolumeDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      name={name}
      fetchDetail={() => GetPersistentVolumeDetail(name)}
      fetchEvents={() => GetPersistentVolumeEvents(name)}
      eventChannel="persistentvolumes:changed"
      resourceLabel="persistent volume"
    >
      {(pv, events) => (
        <>
          {/* PV overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                {pv.name}
              </h2>
              <StatusBadge status={pv.status} />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Capacity", value: pv.capacity },
                { label: "Access Modes", value: pv.accessModes },
                { label: "Reclaim Policy", value: pv.reclaimPolicy },
                { label: "Age", value: pv.age },
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
                <p className="text-zinc-200">{pv.storageClass || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Volume Mode</span>
                <p className="text-zinc-200">{pv.volumeMode || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Claim</span>
                <p className="text-zinc-200 font-mono text-xs">
                  {pv.claim || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Source</span>
                <p className="text-zinc-200">{pv.source || "\u2014"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
                <p className="text-zinc-200">
                  {pv.creationTimestamp || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                <p className="text-zinc-200 font-mono text-xs truncate">
                  {pv.uid}
                </p>
              </div>
            </div>
          </section>

          {/* Mount Options */}
          {pv.mountOptions && pv.mountOptions.length > 0 && (
            <section>
              <SectionHeading>
                Mount Options ({pv.mountOptions.length})
              </SectionHeading>
              <div className="flex flex-wrap gap-1.5">
                {pv.mountOptions.map((opt) => (
                  <span
                    key={opt}
                    className="bg-zinc-900 px-2 py-0.5 text-xs font-mono text-zinc-300 rounded-sm"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Labels & Annotations */}
          {((pv.labels && Object.keys(pv.labels).length > 0) ||
            (pv.annotations && Object.keys(pv.annotations).length > 0)) && (
            <section className="flex flex-col gap-4">
              {pv.labels && Object.keys(pv.labels).length > 0 && (
                <div>
                  <SectionHeading>Labels</SectionHeading>
                  <KeyValueList entries={pv.labels} />
                </div>
              )}
              {pv.annotations && Object.keys(pv.annotations).length > 0 && (
                <div>
                  <SectionHeading>Annotations</SectionHeading>
                  <KeyValueList entries={pv.annotations} />
                </div>
              )}
            </section>
          )}

          {/* Events */}
          <section>
            <SectionHeading>Events ({events.length})</SectionHeading>
            <EventsTable
              events={events}
              emptyMessage="No events found for this persistent volume."
            />
          </section>
        </>
      )}
    </ResourceDetailView>
  );
}
