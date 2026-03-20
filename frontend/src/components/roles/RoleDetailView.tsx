import { useEffect, useState } from "react";
import {
  GetRoleDetail,
  GetClusterRoleDetail,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { useNavigation } from "@/navigation";

interface RoleDetailViewProps {
  namespace?: string;
  name: string;
  isClusterRole?: boolean;
}

export function RoleDetailView({
  namespace,
  name,
  isClusterRole,
}: RoleDetailViewProps) {
  const { goBack } = useNavigation();
  const [role, setRole] = useState<kube.RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const detail = isClusterRole
          ? await GetClusterRoleDetail(name)
          : await GetRoleDetail(namespace!, name);
        setRole(detail);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name, isClusterRole]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading role details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Roles
        </Button>
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back */}
        <div>
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
        </div>

        {/* Role overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 truncate">
                {role.name}
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-sm align-middle text-blue-400 bg-blue-500/10">
                  {role.kind}
                </span>
              </h2>
              {role.namespace && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {role.namespace}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Kind", value: role.kind },
              {
                label: "Rules",
                value: String(role.rules ? role.rules.length : 0),
              },
              { label: "Age", value: role.age },
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
                {role.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-zinc-500">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {role.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Rules table */}
        <section>
          <SectionHeading>
            Rules ({role.rules ? role.rules.length : 0})
          </SectionHeading>
          {!role.rules || role.rules.length === 0 ? (
            <p className="text-zinc-500 text-sm px-1">No rules.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr>
                    {[
                      "API Groups",
                      "Resources",
                      "Verbs",
                      "Resource Names",
                      "Non-Resource URLs",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {role.rules.map((rule, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {rule.apiGroups && rule.apiGroups.length > 0
                          ? rule.apiGroups.join(", ")
                          : "\u2014"}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {rule.resources && rule.resources.length > 0
                          ? rule.resources.join(", ")
                          : "\u2014"}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {rule.verbs && rule.verbs.length > 0
                          ? rule.verbs.join(", ")
                          : "\u2014"}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {rule.resourceNames && rule.resourceNames.length > 0
                          ? rule.resourceNames.join(", ")
                          : "\u2014"}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {rule.nonResourceURLs &&
                        rule.nonResourceURLs.length > 0
                          ? rule.nonResourceURLs.join(", ")
                          : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Labels & Annotations */}
        {((role.labels && Object.keys(role.labels).length > 0) ||
          (role.annotations &&
            Object.keys(role.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {role.labels && Object.keys(role.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={role.labels} />
              </div>
            )}
            {role.annotations &&
              Object.keys(role.annotations).length > 0 && (
                <div>
                  <SectionHeading>Annotations</SectionHeading>
                  <KeyValueList entries={role.annotations} />
                </div>
              )}
          </section>
        )}
      </div>
    </div>
  );
}
