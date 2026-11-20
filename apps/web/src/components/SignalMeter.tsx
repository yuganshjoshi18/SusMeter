import { Flag, ScanLine } from 'lucide-react';

export function SignalMeter() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] animate-fade-up [animation-delay:120ms]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-accent/10 blur-3xl" />

      <div className="surface relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ScanLine size={15} className="text-accent" />
            Behaviour scan
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-zinc-500">
            Live preview
          </span>
        </div>

        <div className="relative mt-4 flex aspect-square items-center justify-center">
          <div className="absolute inset-[8%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[20%] rounded-full border border-white/[0.07]" />
          <div className="absolute inset-[32%] rounded-full border border-white/[0.08]" />
          <div className="absolute inset-[8%] radar-mask animate-sweep rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(239,68,68,0.32)_60deg,transparent_100deg)]" />

          <div className="absolute left-[12%] top-[26%] h-2 w-2 rounded-full bg-healthy shadow-[0_0_14px_4px_rgba(34,197,94,0.18)]" />
          <div className="absolute right-[20%] top-[38%] h-2.5 w-2.5 rounded-full bg-warning shadow-[0_0_14px_4px_rgba(234,179,8,0.2)]" />
          <div className="absolute bottom-[24%] left-[28%] h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_6px_rgba(239,68,68,0.22)]" />

          <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/10 bg-[#0D0D0F] shadow-card">
            <Flag size={22} className="text-accent" fill="currentColor" fillOpacity="0.18" />
            <span className="mt-1 font-display text-sm font-bold text-primary">SusMeter</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
          {[
            { label: 'Green', color: 'bg-healthy', text: 'text-healthy' },
            { label: 'Yellow', color: 'bg-warning', text: 'text-warning' },
            { label: 'Red', color: 'bg-accent', text: 'text-accent' },
          ].map((item) => (
            <div key={item.label} className="surface-soft flex items-center justify-center gap-2 py-2.5">
              <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
              <span className={`text-xs font-semibold ${item.text}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 -left-6 hidden w-56 rotate-[-4deg] rounded-2xl border border-white/[0.08] bg-[#151517] p-4 shadow-card sm:block">
        <p className="text-[11px] font-semibold text-accent">Pattern spotted</p>
        <p className="mt-1.5 text-xs leading-5 text-zinc-300">
          “I need to know where you are every minute.”
        </p>
      </div>
    </div>
  );
}
