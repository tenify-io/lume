import { useEffect, useState } from "react";
import { GetSecretDetail } from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { useNavigation } from "@/navigation";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface SecretDetailViewProps {
  namespace: string;
  name: string;
}

export function SecretDetailView({ namespace, name }: SecretDetailViewProps) {
  const { goBack } = useNavigation();
  const [secret, setSecret] = useState<kube.SecretDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const toggleReveal = (key: string) =>
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch {
      // clipboard not available
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const detail = await GetSecretDetail(namespace, name);
        setSecret(detail);
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
      "secrets:changed",
      (event: {
        type: string;
        data: { name: string; namespace: string };
      }) => {
        if (event.data.name !== name || event.data.namespace !== namespace)
          return;

        if (event.type === "DELETED") {
          setError("This secret has been deleted");
          setSecret(null);
          return;
        }

        GetSecretDetail(namespace, name)
          .then((detail) => {
            setSecret(detail);
          })
          .catch(() => {});
      },
    );

    return () => cancel();
  }, [namespace, name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading secret details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Secrets
        </Button>
      </div>
    );
  }

  if (!secret) return null;

  const dataKeys = secret.data ? Object.keys(secret.data).sort() : [];

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Secret overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {secret.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {secret.namespace}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Type", value: secret.type },
              {
                label: "Data Keys",
                value: String(dataKeys.length),
              },
              { label: "Age", value: secret.age },
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
                {secret.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {secret.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Data */}
        <section>
          <SectionHeading>Data ({dataKeys.length})</SectionHeading>
          {dataKeys.length === 0 ? (
            <p className="text-zinc-500 text-sm px-1">No data entries.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {dataKeys.map((key) => {
                const isRevealed = revealed[key] ?? false;
                const isCopied = copied[key] ?? false;
                return (
                  <div
                    key={key}
                    className="bg-zinc-900 rounded-sm px-4 py-2.5 flex items-center gap-3"
                  >
                    <span className="font-mono text-xs font-semibold text-zinc-200 min-w-0 shrink-0">
                      {key}
                    </span>
                    <span className="font-mono text-xs text-zinc-400 flex-1 min-w-0 truncate">
                      {isRevealed ? secret.data[key] : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        onClick={() => toggleReveal(key)}
                        title={isRevealed ? "Hide value" : "Reveal value"}
                      >
                        {isRevealed ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                      <button
                        className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        onClick={() => copyValue(key, secret.data[key])}
                        title="Copy value"
                      >
                        {isCopied ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Labels & Annotations */}
        {((secret.labels && Object.keys(secret.labels).length > 0) ||
          (secret.annotations &&
            Object.keys(secret.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {secret.labels &&
              Object.keys(secret.labels).length > 0 && (
                <div>
                  <SectionHeading>Labels</SectionHeading>
                  <KeyValueList entries={secret.labels} />
                </div>
              )}
            {secret.annotations &&
              Object.keys(secret.annotations).length > 0 && (
                <div>
                  <SectionHeading>Annotations</SectionHeading>
                  <KeyValueList entries={secret.annotations} />
                </div>
              )}
          </section>
        )}
      </div>
    </div>
  );
}
