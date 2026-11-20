interface AnalysisLoaderProps {
  label?: string;
}

export function AnalysisLoader({ label = 'Inspecting the evidence.' }: AnalysisLoaderProps) {
  return (
    <div className="surface flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-accent/15" />
        <div className="absolute inset-5 rounded-full border border-accent/20" />
        <div className="absolute inset-11 rounded-full border border-accent/30" />
        <div className="radar-mask absolute inset-0 animate-sweep rounded-full bg-[conic-gradient(from_0deg,rgba(239,68,68,0)_0deg,rgba(239,68,68,0.42)_55deg,rgba(239,68,68,0)_90deg)]" />
        <div className="absolute h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_20px_8px_rgba(239,68,68,0.25)]" />
        <div className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/30" />
      </div>
      <p className="mt-6 font-display text-lg font-semibold text-primary">{label}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        Reading the wording, checking for patterns, and keeping the context caveats attached.
      </p>
      <div className="mt-6 flex gap-1.5">
        <span className="h-1.5 w-8 animate-pulse rounded-full bg-accent/70" />
        <span className="h-1.5 w-2 animate-pulse rounded-full bg-accent/40 [animation-delay:150ms]" />
        <span className="h-1.5 w-2 animate-pulse rounded-full bg-accent/20 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
