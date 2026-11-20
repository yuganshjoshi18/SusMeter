import { useEffect, useState } from 'react';
import { Database, Download, ShieldCheck, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Toggle } from '@/components/Toggle';
import { Button } from '@/components/Button';
import { api, type PrivacySettings } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

const defaults: PrivacySettings = {
  storeAssessments: true,
  allowAnalytics: false,
  emailNotifications: true,
};

export function Privacy() {
  const [settings, setSettings] = useState<PrivacySettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    api.settings
      .get()
      .then((response) => {
        if (active) setSettings(response);
      })
      .catch(() => {
        if (active) notify('Could not load your privacy settings.', 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  const update = async (key: keyof Pick<PrivacySettings, 'storeAssessments' | 'allowAnalytics' | 'emailNotifications'>, value: boolean) => {
    const previous = settings;
    setSettings((current) => ({ ...current, [key]: value }));
    try {
      const saved = await api.settings.update({ [key]: value });
      setSettings(saved);
      notify('Privacy setting saved.', 'success');
    } catch (caught) {
      setSettings(previous);
      notify(errorMessage(caught), 'error');
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'susmeter-privacy-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    notify('Settings exported.', 'success');
  };

  const deleteData = async () => {
    setDeleting(true);
    try {
      const result = await api.settings.deleteData();
      notify(`Removed ${result.deletedAssessments} assessments and ${result.deletedReports} reports.`, 'success');
      setConfirming(false);
    } catch (caught) {
      notify(errorMessage(caught), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Privacy settings"
        description="You decide what SusMeter keeps. The defaults are deliberately quiet."
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="shimmer relative h-20 overflow-hidden rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      ) : (
        <section className="surface px-6">
          <Toggle
            checked={settings.storeAssessments}
            onChange={(value) => update('storeAssessments', value)}
            label="Save my assessments"
            description="When on, new checks are saved to your account with their results. Turning it off stops future saves; it does not delete what is already stored."
          />
          <div className="hairline" />
          <Toggle
            checked={settings.allowAnalytics}
            onChange={(value) => update('allowAnalytics', value)}
            label="Allow anonymous usage analytics"
            description="Off by default. This preference is stored so future analytics features can respect it."
          />
          <div className="hairline" />
          <Toggle
            checked={settings.emailNotifications}
            onChange={(value) => update('emailNotifications', value)}
            label="Email notifications"
            description="Preference for occasional product updates. No notification emails are sent by this build."
          />
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="surface p-6">
          <div className="flex items-center gap-2">
            <Database size={17} className="text-accent" />
            <h2 className="font-display text-base font-semibold text-primary">What gets stored</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm leading-6 text-muted">
            <li>· Your email, optional display name and hashed password.</li>
            <li>· Assessment input, results and report summaries when saving is on.</li>
            <li>· The three privacy preferences above.</li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-zinc-600">
            Pasted text stays in your saved assessment only if you chose to save that check.
          </p>
          <button type="button" onClick={exportData} className="btn-secondary mt-5 !py-2.5 text-xs">
            <Download size={14} /> Export settings
          </button>
        </div>

        <div className="surface p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-healthy" />
            <h2 className="font-display text-base font-semibold text-primary">Your data, your call</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Delete saved assessments and reports from your account. Your account and privacy
            preferences stay intact.
          </p>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="btn-danger mt-5 !py-2.5 text-xs"
            >
              <Trash2 size={14} /> Delete saved data
            </button>
          ) : (
            <div className="mt-5 rounded-xl border border-accent/25 bg-accent/[0.06] p-4">
              <p className="text-xs leading-5 text-zinc-300">
                This permanently removes saved assessments and reports. It cannot be undone.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="danger" size="sm" loading={deleting} onClick={deleteData}>
                  Yes, delete
                </Button>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-2 text-xs"
                  onClick={() => setConfirming(false)}
                >
                  Keep it
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
