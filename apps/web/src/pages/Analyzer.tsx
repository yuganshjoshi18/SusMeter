import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardPaste, LockKeyhole, ScanText, Sparkles } from 'lucide-react';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const examples = [
  {
    label: 'Controlling language',
    text: 'I need you to tell me where you are and who you are with every minute. If you go out with your friends, I will ignore you for a week.',
  },
  {
    label: 'Healthy repair',
    text: 'I was out of line when I snapped. I am sorry, and I will step away next time I feel heated. You can disagree with me and I will not punish you.',
  },
  {
    label: 'Boundary pressure',
    text: 'I said no to lending money and they kept asking, bringing up my family each time. Then they said if I did not do it they would tell everyone my secret.',
  },
];

export function Analyzer() {
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.assessments.text(text, context.trim() || undefined);
      notify(response.saved ? 'Conversation check saved. Results ready.' : 'Your results are ready.', 'success');
      navigate('/results', {
        state: { result: response.result, saved: response.saved, id: response.id },
      });
    } catch (caught) {
      setError(errorMessage(caught));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <p className="kicker">Text analyzer</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-primary">Let&apos;s inspect the evidence.</h1>
        <p className="mt-2 text-sm text-muted">Reading the passage and keeping the caveats attached.</p>
        <div className="mt-8">
          <AnalysisLoader label="Scanning the conversation." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Text analyzer</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-primary">Paste it here. Read it clearly.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Paste a conversation or describe a situation. The analyzer checks six language patterns
            and shows the wording behind each one.
          </p>
        </div>
        <span className="text-xs text-zinc-600">{text.length.toLocaleString()} / 12,000 characters</span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="surface p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ClipboardPaste size={15} className="text-accent" /> Conversation or situation
          </div>
          <textarea
            name="text"
            className="input mt-4 min-h-72 resize-y leading-7"
            value={text}
            maxLength={12000}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            placeholder="Paste messages, or describe what was said and done. Include enough context to make it readable."
            aria-label="Conversation text to analyze"
          />

          <div className="mt-6">
            <label className="field-label" htmlFor="analyzer-context">
              Context notes <span className="font-normal text-zinc-600">(optional)</span>
            </label>
            <textarea
              id="analyzer-context"
              name="context"
              className="input min-h-24 resize-y"
              value={context}
              maxLength={2000}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Who is speaking? Is this one message or a pattern?"
            />
            <p className="mt-2 text-xs leading-5 text-zinc-600">
              Context is shown with your report for human review. It is not fed into the classifier.
            </p>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={text.trim().length < 12} icon={<ScanText size={16} />}>
              Run behaviour check
            </Button>
            <button type="button" className="btn-ghost text-xs" onClick={() => setText('')}>
              Clear text
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-soft p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-ember" />
              <p className="text-xs font-semibold text-zinc-400">Try an example</p>
            </div>
            <div className="mt-4 space-y-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setText(example.text)}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#0D0D0F] px-3 py-3 text-left text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-primary"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-soft p-5">
            <p className="text-xs font-semibold text-zinc-400">What it looks for</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              {[
                'Controlling language',
                'Boundary violations',
                'Disrespectful communication',
                'Accountability',
                'Coercive language',
                'Healthy communication',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {!user && (
            <div className="rounded-2xl border border-white/[0.06] p-5 text-xs leading-6 text-muted">
              <LockKeyhole size={14} className="mb-2 text-zinc-500" />
              Guests can run a check.{' '}
              <Link className="text-accent hover:text-red-400" to="/register">
                Create an account
              </Link>{' '}
              to save it. <ArrowRight size={12} className="inline" />
            </div>
          )}
        </aside>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-6 text-zinc-600">
        SusMeter reads language patterns, not intent. It cannot verify what happened. If you feel
        unsafe, prioritise your safety and contact local emergency services or a trusted support
        service.
      </p>
    </div>
  );
}
