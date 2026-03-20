interface Condition {
  type: string;
  status: string;
  lastTransitionTime: string;
  reason: string;
  message: string;
}

function conditionStatusClass(status: string): string {
  return status === "True"
    ? "text-emerald-400"
    : status === "False"
      ? "text-red-400"
      : "text-zinc-400";
}

export function ConditionsTable({ conditions }: { conditions: Condition[] }) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {["Type", "Status", "Last Transition", "Reason", "Message"].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {conditions.map((c) => (
            <tr key={c.type}>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 font-medium">
                {c.type}
              </td>
              <td
                className={`px-3 py-1.5 border-b border-zinc-800/30 font-semibold ${conditionStatusClass(c.status)}`}
              >
                {c.status}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400 whitespace-nowrap">
                {c.lastTransitionTime}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400">
                {c.reason}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400">
                {c.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
