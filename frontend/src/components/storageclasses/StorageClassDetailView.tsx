import { useEffect, useState } from "react";
import { GetStorageClassDetail } from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { useNavigation } from "@/navigation";

export function StorageClassDetailView({ name }: { name: string }) {
  const { goBack } = useNavigation();
  const [sc, setSC] = useState<kube.StorageClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const detail = await GetStorageClassDetail(name);
        setSC(detail);
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
        <p>Loading storage class details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to StorageClasses
        </Button>
      </div>
    );
  }

  if (!sc) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* StorageClass overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
              {sc.name}
              {sc.isDefault && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded-sm align-middle">
                  default
                </span>
              )}
            </h2>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Provisioner", value: sc.provisioner },
              { label: "Reclaim Policy", value: sc.reclaimPolicy },
              { label: "Binding Mode", value: sc.volumeBindingMode },
              { label: "Age", value: sc.age },
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
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Volume Expansion</span>
              <p className="text-zinc-200">
                {sc.allowVolumeExpansion ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Created</span>
              <p className="text-zinc-200">
                {sc.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {sc.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Parameters */}
        {sc.parameters && Object.keys(sc.parameters).length > 0 && (
          <section>
            <SectionHeading>
              Parameters ({Object.keys(sc.parameters).length})
            </SectionHeading>
            <KeyValueList entries={sc.parameters} />
          </section>
        )}

        {/* Mount Options */}
        {sc.mountOptions && sc.mountOptions.length > 0 && (
          <section>
            <SectionHeading>
              Mount Options ({sc.mountOptions.length})
            </SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {sc.mountOptions.map((opt) => (
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

        {/* Allowed Topologies */}
        {sc.allowedTopologies && sc.allowedTopologies.length > 0 && (
          <section>
            <SectionHeading>
              Allowed Topologies ({sc.allowedTopologies.length})
            </SectionHeading>
            <div className="flex flex-col gap-1">
              {sc.allowedTopologies.map((topo) => (
                <span
                  key={topo}
                  className="bg-zinc-900 px-2 py-0.5 text-xs font-mono text-zinc-300 rounded-sm w-fit"
                >
                  {topo}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Labels & Annotations */}
        {((sc.labels && Object.keys(sc.labels).length > 0) ||
          (sc.annotations && Object.keys(sc.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {sc.labels && Object.keys(sc.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={sc.labels} />
              </div>
            )}
            {sc.annotations && Object.keys(sc.annotations).length > 0 && (
              <div>
                <SectionHeading>Annotations</SectionHeading>
                <KeyValueList entries={sc.annotations} />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
