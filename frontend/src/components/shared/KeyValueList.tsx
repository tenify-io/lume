export function KeyValueList({ entries }: { entries: Record<string, string> }) {
  if (!entries || Object.keys(entries).length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(entries).map(([k, v]) => (
        <div
          key={k}
          className="flex gap-2 text-[12px] font-mono leading-relaxed"
        >
          <span className="text-zinc-500 shrink-0">{k}</span>
          <span className="text-zinc-400 break-all">{v}</span>
        </div>
      ))}
    </div>
  );
}
