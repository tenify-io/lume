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

function statusDotClass(status: string): string {
  switch (status.toLowerCase()) {
    case "running":
    case "ready":
      return "bg-emerald-400";
    case "succeeded":
      return "bg-sky-400";
    case "pending":
      return "bg-amber-400";
    case "failed":
    case "notready":
      return "bg-red-400";
    default:
      return "bg-zinc-400";
  }
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${statusColorClass(status)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(status)}`} />
      {status}
    </span>
  );
}
