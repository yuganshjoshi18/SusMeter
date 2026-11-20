interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="surface-soft p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted">{label}</p>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
