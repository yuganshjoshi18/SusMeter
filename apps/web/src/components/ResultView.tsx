import type { AssessmentResult } from '@susmeter/shared';
import { AlertTriangle, Check, Info, Quote, ShieldAlert, Sparkles } from 'lucide-react';
import { IndicatorBadge } from './IndicatorBadge';
import { formatDate, titleCase } from '@/lib/format';
import { indicatorStyles, overallCopy } from '@/lib/indicators';

interface ResultViewProps {
  result: AssessmentResult;
  createdAt?: string;
  onNewCheck?: () => void;
}

export function ResultView({ result, createdAt, onNewCheck }: ResultViewProps) {
  const overall = overallCopy[result.overallIndicator];
  const style = indicatorStyles[result.overallIndicator];
  const evidenceCount = result.categories.reduce((total, category) => total + category.evidence.length, 0);

  return (
    <div className="space-y-6">
      <section className={`surface relative overflow-hidden border ${style.border}`}>
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${style.text} to-transparent opacity-40`} />
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <IndicatorBadge indicator={result.overallIndicator} />
              <span className="text-xs text-zinc-500">{formatDate(createdAt || result.meta.generatedAt)}</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold text-primary sm:text-4xl">
              {result.headline}
            </h2>
            <p className="mt-2 text-sm font-semibold text-zinc-200">{overall.title}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{overall.body}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">{result.summary}</p>
            {onNewCheck && (
              <button type="button" onClick={onNewCheck} className="btn-secondary mt-6 !py-2.5 text-xs">
                Run another check
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 self-start">
            <div className="surface-soft p-4">
              <p className="text-xs text-zinc-500">Areas reviewed</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">{result.categories.length}</p>
            </div>
            <div className="surface-soft p-4">
              <p className="text-xs text-zinc-500">Evidence items</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">{evidenceCount}</p>
            </div>
            <div className="surface-soft col-span-2 p-4">
              <p className="text-xs text-zinc-500">Uncertainty</p>
              <p className="mt-1 text-sm font-semibold capitalize text-primary">{result.uncertainty.level}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{result.uncertainty.explanation}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/[0.06] p-4">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-xs leading-6 text-zinc-300">
          {result.safetyNote ||
            'This tool examines reported behaviour, not character or intent. It cannot verify what happened or diagnose anyone.'}
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-primary">What the check found</h3>
            <p className="mt-1 text-sm text-muted">Category by category, with the wording behind each signal.</p>
          </div>
        </div>

        <div className="space-y-4">
          {result.categories.map((category) => {
            const categoryStyle = indicatorStyles[category.indicator];
            return (
              <article
                key={category.id}
                className={`surface overflow-hidden border ${categoryStyle.border}`}
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-display text-lg font-semibold text-primary">{category.label}</h4>
                      <IndicatorBadge indicator={category.indicator} compact />
                    </div>
                    <p className="mt-2 text-sm font-medium text-zinc-200">{category.summary}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{category.detail}</p>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] bg-black/10 px-5 py-4">
                  <p className="mb-3 text-xs font-semibold text-zinc-500">Supporting evidence</p>
                  <div className="space-y-2.5">
                    {category.evidence.map((item) => (
                      <div key={item.id} className="rounded-xl border border-white/[0.06] bg-[#0D0D0F] p-4">
                        <div className="flex items-start gap-3">
                          <Quote size={15} className="mt-0.5 shrink-0 text-zinc-600" />
                          <div>
                            <p className="text-sm leading-6 text-zinc-200">“{item.text}”</p>
                            <p className="mt-2 text-xs leading-5 text-muted">
                              {item.note} {item.source && <span className="text-zinc-600">· {item.source}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {category.limitations.length > 0 && (
                    <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-zinc-600">
                      <Info size={13} className="mt-0.5 shrink-0" />
                      {category.limitations[0]}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {(result.strengths.length > 0 || result.watchpoints.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface p-5">
            <div className="flex items-center gap-2">
              <Check size={17} className="text-healthy" />
              <h3 className="font-display text-base font-semibold text-primary">Healthier signals</h3>
            </div>
            {result.strengths.length ? (
              <ul className="mt-4 space-y-2">
                {result.strengths.map((item) => (
                  <li key={item} className="text-sm text-zinc-300">· {item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">None surfaced in this sample.</p>
            )}
          </div>

          <div className="surface p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-warning" />
              <h3 className="font-display text-base font-semibold text-primary">Worth keeping an eye on</h3>
            </div>
            {result.watchpoints.length ? (
              <ul className="mt-4 space-y-2">
                {result.watchpoints.map((item) => (
                  <li key={item} className="text-sm text-zinc-300">· {item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Nothing crossed a threshold here.</p>
            )}
          </div>
        </section>
      )}

      <section className="surface p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-accent" />
          <h3 className="font-display text-base font-semibold text-primary">Assessment limitations</h3>
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {result.limitations.map((limitation) => (
            <li key={limitation} className="flex gap-2 text-sm leading-6 text-muted">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
              {limitation}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-600">
          <span>Engine: {titleCase(result.meta.engine)}</span>
          {result.meta.modelVersion && <span>Model: {result.meta.modelVersion}</span>}
          <span>Generated: {formatDate(result.meta.generatedAt)}</span>
        </div>
      </section>
    </div>
  );
}
