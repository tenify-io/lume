export function KeyValueList({ entries }: { entries: Record<string, string> }) {
  if (!entries || Object.keys(entries).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(entries).map(([k, v]) => (
        <div
          key={k}
          className="flex items-center rounded-sm overflow-hidden border border-zinc-800/30"
        >
          <span className="bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-500">
            {k}
          </span>
          <span className="bg-zinc-700 px-2 py-1 text-[10px] font-bold text-zinc-200">
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
