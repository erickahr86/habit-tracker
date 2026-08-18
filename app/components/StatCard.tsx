export function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-xs font-mono text-fg-muted uppercase">{label}</div>
      <div className="mt-2 font-mono text-2xl">
        {value} <span className="text-fg-muted text-sm">{unit}</span>
      </div>
    </div>
  );
}
