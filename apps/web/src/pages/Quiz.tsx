import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleHelp, LockKeyhole } from 'lucide-react';
import type { QuestionBank } from '@susmeter/shared';
import bank from '@susmeter/shared/questions.json';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { errorMessage, titleCase } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const questionBank = bank as QuestionBank;
const questions = questionBank.questions;

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [context, setContext] = useState('');
  const [stage, setStage] = useState<'questions' | 'review' | 'loading'>('questions');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const question = questions[step];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const choose = (optionId: string) => {
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
    setError('');
  };

  const goNext = () => {
    if (!answers[question.id]) {
      setError('Pick the option that fits best. There are no trick answers.');
      return;
    }
    if (step < questions.length - 1) {
      setStep((current) => current + 1);
    } else {
      setStage('review');
    }
  };

  const submit = async () => {
    setStage('loading');
    setError('');
    try {
      const response = await api.assessments.quiz(answers, context.trim() || undefined);
      notify(
        response.saved ? 'Behaviour check saved. Your results are ready.' : 'Your results are ready.',
        'success',
      );
      navigate('/results', {
        state: {
          result: response.result,
          saved: response.saved,
          id: response.id,
        },
      });
    } catch (caught) {
      setError(errorMessage(caught));
      setStage('review');
    }
  };

  if (stage === 'loading') {
    return (
      <div>
        <p className="kicker">Behaviour quiz</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-primary">Let&apos;s inspect the evidence.</h1>
        <p className="mt-2 text-sm text-muted">Turning your answers into category findings.</p>
        <div className="mt-8">
          <AnalysisLoader label="Checking the behaviour patterns." />
        </div>
      </div>
    );
  }

  if (stage === 'review') {
    return (
      <div>
        <Link to="/quiz" className="btn-ghost mb-6 -ml-3 text-xs" onClick={() => setStage('questions')}>
          <ArrowLeft size={15} /> Back to questions
        </Link>
        <p className="kicker">Final step</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-primary">Ready for a once-over?</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {answeredCount} of {questions.length} questions answered. You can jump back and change
          anything before running the check.
        </p>

        <div className="surface mt-8 divide-y divide-white/[0.05]">
          {questions.map((item, index) => {
            const optionId = answers[item.id];
            const option = item.options.find((choice) => choice.id === optionId);
            return (
              <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-600">
                    {index + 1}. {titleCase(item.category)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">{item.prompt}</p>
                  <p className={`mt-1 text-xs ${option ? 'text-accent' : 'text-warning'}`}>
                    {option ? option.label : 'Not answered'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-2 text-xs"
                  onClick={() => {
                    setStep(index);
                    setStage('questions');
                  }}
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>

        <div className="surface mt-6 p-5">
          <label className="field-label" htmlFor="context">
            Anything we should know? <span className="font-normal text-zinc-600">(optional)</span>
          </label>
          <textarea
            id="context"
            name="context"
            className="input min-h-24 resize-y"
            value={context}
            maxLength={2000}
            onChange={(event) => setContext(event.target.value)}
            placeholder="How long has this been going on? Is this one situation or a pattern?"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Context is saved with your report for human review. It does not change the model output.
          </p>
        </div>

        {!user && (
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted">
            <LockKeyhole size={14} className="mt-0.5 shrink-0 text-zinc-500" />
            You can run this without an account.{' '}
            <Link className="font-semibold text-accent hover:text-red-400" to="/register">
              Sign up
            </Link>{' '}
            if you want to save it.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={submit} icon={<Check size={16} />}>
            Run the behaviour check
          </Button>
          <Link to="/dashboard" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Something feels sus?</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-primary">Run a behaviour check.</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Answer honestly. This is about patterns, not a pop quiz on your relationship.
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          Question <span className="font-semibold text-primary">{step + 1}</span> of {questions.length}
        </p>
      </div>

      <div className="mt-8">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-ember transition-[width] duration-500"
            style={{ width: `${Math.max(progress, ((step + 1) / questions.length) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-600">
          <span>{answeredCount} answered</span>
          <span>{progress}% complete</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_260px]">
        <section className="surface p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <CircleHelp size={15} /> {titleCase(question.category)}
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-primary">
            {question.prompt}
          </h2>
          <p className="mt-2 text-sm text-muted">{question.hint}</p>

          <div className="mt-7 space-y-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose(option.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow] ${
                    selected
                      ? 'border-accent/50 bg-accent/[0.08] ring-1 ring-accent/20'
                      : 'border-white/[0.07] bg-[#0D0D0F] hover:border-white/20 hover:bg-white/[0.035]'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                      selected ? 'border-accent bg-accent text-white' : 'border-white/15 text-zinc-500'
                    }`}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-primary">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">{option.description}</span>
                  </span>
                  {selected && <Check size={17} className="ml-auto mt-1 shrink-0 text-accent" />}
                </button>
              );
            })}
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-warning/25 bg-warning/[0.06] px-4 py-3 text-sm text-zinc-300">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-ghost"
              disabled={step === 0}
              onClick={() => {
                setStep((current) => current - 1);
                setError('');
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <Button onClick={goNext}>
              {step === questions.length - 1 ? 'Review answers' : 'Next question'} <ArrowRight size={16} />
            </Button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-soft p-5">
            <p className="text-xs font-semibold text-zinc-400">This area checks</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {questionBank.categories.find((category) => category.id === question.category)?.description}
            </p>
          </div>
          <div className="surface-soft p-5">
            <p className="text-xs font-semibold text-zinc-400">Why we ask</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Small, repeated behaviours usually tell you more than one dramatic moment.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] p-5 text-xs leading-6 text-zinc-600">
            Context matters. Always. This check describes reported behaviour, not character.
          </div>
        </aside>
      </div>
    </div>
  );
}
