interface EventInfo {
  type: string;
  reason: string;
  message: string;
  source: string;
  count: number;
  firstTimestamp: string;
  lastTimestamp: string;
  age: string;
}

function eventTypeClass(type: string): string {
  return type === "Warning" ? "text-amber-400" : "text-zinc-400";
}

export function EventsTable({
  events,
  emptyMessage = "No events found.",
}: {
  events: EventInfo[];
  emptyMessage?: string;
}) {
  if (events.length === 0) {
    return (
      <p className="text-zinc-600 text-[13px]">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {["Type", "Reason", "Age", "Source", "Message"].map((h) => (
              <th
                key={h}
                className="px-3 py-1.5 text-left text-[11px] font-semibold text-zinc-600 bg-zinc-900 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td
                className={`px-3 py-1.5 border-b border-zinc-800/30 font-semibold whitespace-nowrap ${eventTypeClass(e.type)}`}
              >
                {e.type}
                {e.count > 1 && (
                  <span className="text-zinc-600 font-normal ml-1">
                    x{e.count}
                  </span>
                )}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 whitespace-nowrap">
                {e.reason}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-400 whitespace-nowrap">
                {e.age}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-500 whitespace-nowrap font-mono text-xs">
                {e.source}
              </td>
              <td className="px-3 py-1.5 border-b border-zinc-800/30 text-zinc-300">
                {e.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
