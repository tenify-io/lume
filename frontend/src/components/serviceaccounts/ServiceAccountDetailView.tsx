import { useEffect, useState } from "react";
import { GetServiceAccountDetail } from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { useNavigation } from "@/navigation";

interface ServiceAccountDetailViewProps {
  namespace: string;
  name: string;
}

export function ServiceAccountDetailView({
  namespace,
  name,
}: ServiceAccountDetailViewProps) {
  const { goBack } = useNavigation();
  const [serviceaccount, setServiceaccount] = useState<kube.ServiceAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const detail = await GetServiceAccountDetail(namespace, name);
        setServiceaccount(detail);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name]);

  // Live updates
  useEffect(() => {
    const cancel = EventsOn(
      "serviceaccounts:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This service account has been deleted");
          setServiceaccount(null);
          return;
        }

        GetServiceAccountDetail(namespace, name)
          .then((detail) => {
            setServiceaccount(detail);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading service account details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to ServiceAccounts
        </Button>
      </div>
    );
  }

  if (!serviceaccount) return null;

  function formatAutomount(val: boolean | undefined | null): string {
    if (val === true) return "Yes";
    if (val === false) return "No";
    return "Not Set";
  }

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* ServiceAccount overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {serviceaccount.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {serviceaccount.namespace}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
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
              <div key={s.label} className="bg-zinc-950 rounded-sm px-3 py-2">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mt-0.5">
                  {s.value || "\u2014"}
                </div>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <div>
              <span className="text-zinc-500">Created</span>
              <p className="text-zinc-200">
                {serviceaccount.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {serviceaccount.uid}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Automount Token</span>
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
      </div>
    </div>
  );
}
