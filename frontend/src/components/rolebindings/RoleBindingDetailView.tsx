import { useEffect, useState } from "react";
import {
  GetRoleBindingDetail,
  GetClusterRoleBindingDetail,
} from "../../../wailsjs/go/main/App";
import { kube } from "../../../wailsjs/go/models";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { KeyValueList } from "@/components/shared/KeyValueList";
import { ResourceToolbar, ToolbarAction } from "@/components/shared/ResourceToolbar";
import { Pencil, Trash2, Copy } from "lucide-react";
import { useNavigation } from "@/navigation";

interface RoleBindingDetailViewProps {
  namespace?: string;
  name: string;
  isClusterRoleBinding?: boolean;
}

export function RoleBindingDetailView({
  namespace,
  name,
  isClusterRoleBinding,
}: RoleBindingDetailViewProps) {
  const { goBack, navigate } = useNavigation();
  const [binding, setBinding] = useState<kube.RoleBindingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const detail = isClusterRoleBinding
          ? await GetClusterRoleBindingDetail(name)
          : await GetRoleBindingDetail(namespace!, name);
        setBinding(detail);
      } catch (e: unknown) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [namespace, name, isClusterRoleBinding]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3">
        <p>Loading binding details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-red-400">{error}</p>
        <Button variant="secondary" onClick={goBack}>
          Back to Bindings
        </Button>
      </div>
    );
  }

  if (!binding) return null;

  const actions: ToolbarAction[] = [
    { id: "edit", label: "Edit YAML", icon: Pencil, onClick: () => {}, group: "primary" },
    { id: "copy", label: "Copy Name", icon: Copy, onClick: () => navigator.clipboard.writeText(name), group: "primary" },
    { id: "delete", label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" as const, group: "danger" },
  ];

  function handleRoleRefClick() {
    if (!binding) return;
    if (binding.roleRef.kind === "ClusterRole") {
      navigate({
        page: "clusterrole-detail",
        name: binding.roleRef.name,
      });
    } else {
      navigate({
        page: "role-detail",
        namespace: binding.namespace,
        name: binding.roleRef.name,
      });
    }
  }

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Back + Toolbar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goBack}>
            &larr; Back
          </Button>
          <ResourceToolbar actions={actions} />
        </div>

        {/* Binding overview */}
        <section className="bg-zinc-900 rounded-sm px-5 py-4 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
                {binding.name}
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-sm align-middle text-emerald-400 bg-emerald-500/10">
                  {binding.kind}
                </span>
              </h2>
              {binding.namespace && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {binding.namespace}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Kind", value: binding.kind },
              {
                label: "Subjects",
                value: String(binding.subjects ? binding.subjects.length : 0),
              },
              { label: "Age", value: binding.age },
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
                {binding.creationTimestamp || "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-medium">UID</span>
              <p className="text-zinc-200 font-mono text-xs truncate">
                {binding.uid}
              </p>
            </div>
          </div>
        </section>

        {/* Role Reference */}
        <section>
          <SectionHeading>Role Reference</SectionHeading>
          <div className="bg-zinc-900 rounded-sm px-5 py-4">
            <div className="grid grid-cols-3 gap-4 text-[13px]">
              <div>
                <span className="text-zinc-500">Kind</span>
                <p className="text-zinc-200">{binding.roleRef.kind}</p>
              </div>
              <div>
                <span className="text-zinc-500">Name</span>
                <p>
                  <button
                    onClick={handleRoleRefClick}
                    className="text-zinc-200 hover:underline cursor-pointer"
                  >
                    {binding.roleRef.name}
                  </button>
                </p>
              </div>
              <div>
                <span className="text-zinc-500">API Group</span>
                <p className="text-zinc-200 font-mono text-xs">
                  {binding.roleRef.apiGroup || "\u2014"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects table */}
        <section>
          <SectionHeading>
            Subjects ({binding.subjects ? binding.subjects.length : 0})
          </SectionHeading>
          {!binding.subjects || binding.subjects.length === 0 ? (
            <p className="text-zinc-500 text-sm px-1">No subjects.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr>
                    {["Kind", "Name", "Namespace"].map((h) => (
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
                  {binding.subjects.map((subject, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap text-xs">
                        {subject.kind}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap font-mono text-xs">
                        {subject.name}
                      </td>
                      <td className="px-3 py-2 border-b border-zinc-800/30 whitespace-nowrap text-xs">
                        {subject.namespace || "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Labels & Annotations */}
        {((binding.labels && Object.keys(binding.labels).length > 0) ||
          (binding.annotations &&
            Object.keys(binding.annotations).length > 0)) && (
          <section className="flex flex-col gap-4">
            {binding.labels && Object.keys(binding.labels).length > 0 && (
              <div>
                <SectionHeading>Labels</SectionHeading>
                <KeyValueList entries={binding.labels} />
              </div>
            )}
            {binding.annotations &&
              Object.keys(binding.annotations).length > 0 && (
                <div>
                  <SectionHeading>Annotations</SectionHeading>
                  <KeyValueList entries={binding.annotations} />
                </div>
              )}
          </section>
        )}
      </div>
    </div>
  );
}
