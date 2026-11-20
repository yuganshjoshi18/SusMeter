import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  FileText,
  History,
  MessageSquareText,
  ScanLine,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { IndicatorBadge } from '@/components/IndicatorBadge';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { api, type AssessmentListItem, type ReportItem, type UserStats } from '@/lib/api';
import { errorMessage, formatRelative } from '@/lib/format';

export function Dashboard() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.assessments.list(5), api.reports.list(), api.stats.get()])
      .then(([assessmentResponse, reportResponse, statsResponse]) => {
        if (!active) return;
        setAssessments(assessmentResponse.items);
        setReports(reportResponse.items);
        setStats(statsResponse);
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}.`}
        description="Your behaviour checks, evidence and reports, all in one place. No judgment from the dashboard either."
        action={
          <Link to="/quiz" className="btn-primary">
            <ScanLine size={16} /> Start behaviour quiz
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-warning/25 bg-warning/[0.06] px-4 py-3 text-sm text-zinc-300">
          We couldn&apos;t load your saved history. {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/quiz" className="surface group p-6 transition-colors hover:border-accent/30">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.08] text-accent">
            <ClipboardList size={21} />
          </div>
          <h2 className="mt-5 font-display text-lg font-semibold text-primary">Start Behaviour Quiz</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Sixteen questions across eight behaviour areas. Answer at your own pace.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-accent">
            Open quiz <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link to="/analyze" className="surface group p-6 transition-colors hover:border-ember/30">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ember/20 bg-ember/[0.08] text-ember">
            <MessageSquareText size={21} />
          </div>
          <h2 className="mt-5 font-display text-lg font-semibold text-primary">Analyze Conversation</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Paste a conversation or describe a situation. Keep the evidence next to each signal.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-ember">
            Open analyzer <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total checks" value={stats?.totalAssessments ?? '—'} icon={<ScanLine size={16} />} />
        <StatCard label="Saved reports" value={stats?.totalReports ?? '—'} icon={<FileText size={16} />} />
        <StatCard
          label="Last check"
          value={stats?.lastAssessmentAt ? formatRelative(stats.lastAssessmentAt) : '—'}
          icon={<History size={16} />}
        />
        <StatCard
          label="Most reviewed"
          value={stats?.mostCheckedCategory ? stats.mostCheckedCategory.replace('_', ' ') : '—'}
          hint={stats?.mostCheckedCategory ? 'Behaviour area' : undefined}
          icon={<ClipboardList size={16} />}
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <div>
              <h2 className="font-display text-base font-semibold text-primary">Recent assessments</h2>
              <p className="mt-1 text-xs text-muted">The last few things you looked at.</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-accent hover:text-red-400">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((item) => (
                <div key={item} className="shimmer relative h-16 overflow-hidden rounded-xl bg-white/[0.03]" />
              ))}
            </div>
          ) : assessments.length ? (
            <div className="divide-y divide-white/[0.05]">
              {assessments.map((item) => (
                <Link
                  key={item.id}
                  to={`/results/${item.id}`}
                  className="flex items-start justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.025]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-primary">{item.title}</p>
                      <span className="text-[10px] uppercase tracking-wide text-zinc-600">{item.type}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.summary}</p>
                    <p className="mt-1 text-[11px] text-zinc-600">{formatRelative(item.createdAt)}</p>
                  </div>
                  <IndicatorBadge indicator={item.indicator} compact />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<History size={20} />}
                title="No assessments yet"
                description="Run a quiz or paste a conversation. Your saved checks will show up here."
                action={
                  <Link to="/quiz" className="btn-secondary !py-2.5 text-xs">
                    Start a check
                  </Link>
                }
              />
            </div>
          )}
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <h2 className="font-display text-base font-semibold text-primary">Previous reports</h2>
            <p className="mt-1 text-xs text-muted">Saved summaries from past checks.</p>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">
              {[0, 1].map((item) => (
                <div key={item} className="shimmer relative h-14 overflow-hidden rounded-xl bg-white/[0.03]" />
              ))}
            </div>
          ) : reports.length ? (
            <div className="divide-y divide-white/[0.05]">
              {reports.slice(0, 5).map((report) => (
                <Link
                  key={report.id}
                  to={`/results/${report.assessmentId}`}
                  className="block px-6 py-4 transition-colors hover:bg-white/[0.025]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">{report.title}</p>
                    <span className="text-[11px] text-zinc-600">{formatRelative(report.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{report.summary}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<FileText size={20} />}
                title="No reports yet"
                description="Reports appear after a saved assessment. Guest checks stay on this device only."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
