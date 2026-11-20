interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-5">
      <span>
        <span className="block text-sm font-semibold text-primary">{label}</span>
        {description && <span className="mt-1 block max-w-xl text-sm leading-6 text-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="block h-6 w-11 rounded-full border border-white/10 bg-zinc-800 transition-colors peer-checked:border-accent/50 peer-checked:bg-accent peer-disabled:opacity-40" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-zinc-400 transition-transform peer-checked:translate-x-5 peer-checked:bg-white" />
      </span>
    </label>
  );
}
