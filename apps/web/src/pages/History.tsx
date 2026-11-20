import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList, FileText, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusPill } from '@/components/StatusPill';
import { api, type AssessmentListItem } from '@/lib/api';
import { errorMessage, formatDate, formatRelative, titleCase } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

type FilterValue = 'all' | 'quiz' | 'text';

function parseFilter(value: string | null): FilterValue {
  return value === 'quiz' || value === 'text' ? value : 'all';
}

export function History() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseFilter(searchParams.get('filter'));
  const query = searchParams.get('q') ?? '';
  const { notify } = useToast();

  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Assessment history · SusMeter';
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.assessments
      .list(50)
      .then((response) => {
        if (active) {
          setAssessments(response.items);
          setError('');
        }
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateParams = useCallback(
    (next: { filter?: FilterValue; query?: string }) => {
      setSearchParams(
        (previous) => {
          const params = new URLSearchParams(previous);
          if (next.filter !== undefined) {
            if (next.filter === 'all') params.delete('filter');
            else params.set('filter', next.filter);
          }
          if (next.query !== undefined) {
            if (!next.query) params.delete('q');
            else params.set('q', next.query);
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const matchesType = filter === 'all' || assessment.type === filter;
      const haystack = `${assessment.title} ${assessment.summary} ${assessment.type}`.toLowerCase();
      return matchesType && (!needle || haystack.includes(needle));
    });
  }, [assessments, filter, query]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.assessments.remove(id);
      setAssessments((current) => current.filter((item) => item.id !== id));
      notify('Assessment removed.', 'success');
    } catch (caught) {
      notify(errorMessage(caught), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Assessment history"
        description="Revisit past checks and the evidence behind them. Context can change, so read each entry as a snapshot rather than a verdict."
        action={
          <Link to="/quiz" className="btn-secondary !py-2.5 text-xs">
            Start a new check
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-warning/25 bg-warning/[0.06] px-4 py-3 text-sm text-zinc-300">
          We couldn&apos;t load your history. {error}
        </div>
      )}

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search assessments</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateParams({ query: event.target.value })}
              placeholder="Search titles and summaries"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-primary placeholder:text-zinc-600 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </label>
          <div className="flex items-center gap-2" role="group" aria-label="Filter assessments by type">
            {(['all', 'quiz', 'text'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => updateParams({ filter: value })}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  filter === value
                    ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/25'
                    : 'text-muted hover:bg-white/[0.05] hover:text-primary'
                }`}
              >
                {value === 'all' ? 'All' : value === 'quiz' ? 'Quiz' : 'Text'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((item) => (
              <div key={item} className="shimmer relative h-20 overflow-hidden rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        ) : filtered.length ? (
          <ul className="divide-y divide-white/[0.05]">
            {filtered.map((assessment) => (
              <li key={assessment.id} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:px-6">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-accent">
                  {assessment.type === 'quiz' ? <ClipboardList size={18} /> : <FileText size={18} />}
                </span>
                <Link to={`/results/${assessment.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-primary">{assessment.title}</p>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-600">
                      {titleCase(assessment.type)}
                    </span>
                    <StatusPill indicator={assessment.indicator} compact />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{assessment.summary}</p>
                  <p className="mt-1.5 text-[11px] text-zinc-600">
                    {formatDate(assessment.createdAt)} · {formatRelative(assessment.createdAt)}
                  </p>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!px-2 !text-zinc-500 hover:!text-accent"
                  loading={deletingId === assessment.id}
                  onClick={() => handleDelete(assessment.id)}
                  icon={<Trash2 size={15} />}
                  aria-label={`Delete ${assessment.title}`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<Search size={20} />}
              title={assessments.length ? 'No matching checks' : 'No saved checks yet'}
              description={
                assessments.length
                  ? 'Try another search term or filter.'
                  : 'Run a quiz or analyze a conversation. Signed-in checks are saved here when saving is on.'
              }
              action={
                assessments.length ? undefined : (
                  <Link to="/quiz" className="btn-secondary !py-2.5 text-xs">
                    Start a check
                  </Link>
                )
              }
            />
          </div>
        )}
      </section>

      <p className="mt-4 text-xs leading-5 text-zinc-600">
        Showing up to 50 most recent saved checks. Guest checks stay in the current session only.
      </p>
    </div>
  );
}
