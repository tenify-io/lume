export const MetadataRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value ? (
    <div className="flex gap-2 py-1">
      <span className="text-zinc-500 min-w-[140px] shrink-0">{label}</span>
      <span className="text-zinc-200 break-all">{value}</span>
    </div>
  ) : null;
