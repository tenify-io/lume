import { GetServiceAccountDetail } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ResourceDetailView } from "@/components/shared/ResourceDetailView";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";

function formatAutomount(val: boolean | undefined | null): string {
  if (val === true) return "Yes";
  if (val === false) return "No";
  return "Not Set";
}

export function ServiceAccountDetailView({
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
    <ResourceDetailView<kube.ServiceAccountDetail>
      toolbar={<ResourceToolbar actions={actions} />}
      namespace={namespace}
      name={name}
      fetchDetail={() => GetServiceAccountDetail(namespace, name)}
      eventChannel="serviceaccounts:changed"
      resourceLabel="service account"
    >
      {(serviceaccount) => (
        <>
          {/* ServiceAccount overview */}
          <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
            {/* Identity */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                  {serviceaccount.name}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {serviceaccount.namespace}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Secrets",
                  value: String(serviceaccount.secrets ? serviceaccount.secrets.length : 0),
                },
                {
                  label: "Image Pull Secrets",
                  value: String(serviceaccount.imagePullSecrets ? serviceaccount.imagePullSecrets.length : 0),
                },
                { label: "Age", value: serviceaccount.age },
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
                <p className="text-zinc-200">
                  {serviceaccount.creationTimestamp || "\u2014"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
                <p className="text-zinc-200 font-mono text-xs truncate">
                  {serviceaccount.uid}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-medium">Automount Token</span>
                <p className="text-zinc-200">
                  {formatAutomount(serviceaccount.automountServiceAccountToken)}
                </p>
              </div>
            </div>
          </section>

          {/* Secrets */}
          <section>
            <SectionHeading>
              Secrets ({serviceaccount.secrets ? serviceaccount.secrets.length : 0})
            </SectionHeading>
            {!serviceaccount.secrets || serviceaccount.secrets.length === 0 ? (
              <p className="text-zinc-500 text-sm px-1">No secrets.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {serviceaccount.secrets.map((secret) => (
                  <div
                    key={secret}
                    className="bg-zinc-900 rounded-sm px-4 py-2.5 text-sm text-zinc-200 font-mono text-xs"
                  >
                    {secret}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Image Pull Secrets */}
          <section>
            <SectionHeading>
              Image Pull Secrets ({serviceaccount.imagePullSecrets ? serviceaccount.imagePullSecrets.length : 0})
            </SectionHeading>
            {!serviceaccount.imagePullSecrets || serviceaccount.imagePullSecrets.length === 0 ? (
              <p className="text-zinc-500 text-sm px-1">No image pull secrets.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {serviceaccount.imagePullSecrets.map((secret) => (
                  <div
                    key={secret}
                    className="bg-zinc-900 rounded-sm px-4 py-2.5 text-sm text-zinc-200 font-mono text-xs"
                  >
                    {secret}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Labels & Annotations */}
          {((serviceaccount.labels && Object.keys(serviceaccount.labels).length > 0) ||
            (serviceaccount.annotations &&
              Object.keys(serviceaccount.annotations).length > 0)) && (
            <section className="flex flex-col gap-4">
              {serviceaccount.labels &&
                Object.keys(serviceaccount.labels).length > 0 && (
                  <div>
                    <SectionHeading>Labels</SectionHeading>
                    <KeyValueList entries={serviceaccount.labels} />
                  </div>
                )}
              {serviceaccount.annotations &&
                Object.keys(serviceaccount.annotations).length > 0 && (
                  <div>
                    <SectionHeading>Annotations</SectionHeading>
                    <KeyValueList entries={serviceaccount.annotations} />
                  </div>
                )}
            </section>
          )}
        </>
      )}
    </ResourceDetailView>
  );
}
