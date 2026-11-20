import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, type UserStats } from '@/lib/api';
import { errorMessage, formatDate } from '@/lib/format';

export function Profile() {
  const { user, updateName } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    api.stats.get().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateName(name);
      notify('Profile updated.', 'success');
    } catch (caught) {
      notify(errorMessage(caught), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Your account details and a small pile of useful numbers." />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="surface p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 font-display text-xl font-bold text-accent">
              {(user?.name || user?.email || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-primary">{user?.name || 'SusMeter user'}</p>
              <p className="mt-1 text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <form className="mt-8 max-w-md space-y-5" onSubmit={save}>
            <div>
              <label className="field-label" htmlFor="profile-name">
                Display name
              </label>
              <input
                id="profile-name"
                name="name"
                className="input"
                value={name}
                minLength={2}
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="profile-email">
                Email
              </label>
              <input id="profile-email" className="input opacity-60" value={user?.email || ''} readOnly />
              <p className="mt-2 text-xs text-zinc-600">Email changes are not available here yet.</p>
            </div>
            <Button type="submit" loading={saving} size="sm">
              Save changes
            </Button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="surface-soft p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <CalendarDays size={15} /> Member since
            </div>
            <p className="mt-2 text-sm text-primary">
              {formatDate(stats?.memberSince || user?.createdAt)}
            </p>
          </div>
          <div className="surface-soft p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Mail size={15} /> Account email
            </div>
            <p className="mt-2 break-all text-sm text-primary">{user?.email}</p>
          </div>
          <Link to="/privacy" className="surface-soft block p-5 transition-colors hover:border-accent/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <ShieldCheck size={15} /> Privacy
            </div>
            <p className="mt-2 text-sm text-primary">Manage what gets stored →</p>
          </Link>
        </aside>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-base font-semibold text-primary">Your numbers</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Checks run" value={stats?.totalAssessments ?? '—'} icon={<UserRound size={16} />} />
          <StatCard label="Quiz checks" value={stats?.quizCount ?? '—'} />
          <StatCard label="Text checks" value={stats?.textCount ?? '—'} />
          <StatCard label="Reports" value={stats?.totalReports ?? '—'} />
        </div>
      </section>
    </div>
  );
}
