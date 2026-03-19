export function statusColorClass(status: string): string {
  switch (status.toLowerCase()) {
    case "running":
    case "ready":
      return "bg-emerald-950 text-emerald-400";
    case "succeeded":
      return "bg-sky-950 text-sky-400";
    case "pending":
      return "bg-amber-950 text-amber-400";
    case "failed":
    case "notready":
      return "bg-red-950 text-red-400";
    default:
      return "bg-zinc-800 text-zinc-400";
  }
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${statusColorClass(status)}`}
    >
      {status}
    </span>
  );
}
