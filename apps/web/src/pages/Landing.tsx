import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { QuestionBank } from '@susmeter/shared';
import bank from '@susmeter/shared/questions.json';
import { CONTEXT_NOTE } from '@/lib/brand';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingHeader } from '@/components/MarketingHeader';
import { SignalMeter } from '@/components/SignalMeter';

const questionBank = bank as QuestionBank;

const steps = [
  {
    icon: ClipboardList,
    title: 'Tell us what happened',
    body: 'Answer a behaviour quiz or paste a conversation. Nothing needs to be perfectly worded.',
  },
  {
    icon: ScanLine,
    title: 'We inspect the wording',
    body: 'The analyzer looks for communication patterns and keeps the evidence next to each signal.',
  },
  {
    icon: Sparkles,
    title: 'Read it with context',
    body: 'You get green, yellow and red indicators, limitations, and room to decide what comes next.',
  },
];

const categoryIcons = [MessageSquareText, ShieldCheck, ScanLine, ShieldCheck, Sparkles, ClipboardList, ShieldCheck, MessageSquareText];

const faqs = [
  {
    question: 'Does SusMeter tell me if someone is toxic?',
    answer:
      'No. It examines reported behaviours and the wording around them. It does not diagnose people, assign motives, or decide who is good and bad.',
  },
  {
    question: 'Can I use it for any relationship or gender?',
    answer:
      'Yes. The questions and analyzer describe behaviours, not gender roles. Friends, partners, family and colleagues can all be examined with the same lens.',
  },
  {
    question: 'Is this a safety tool?',
    answer:
      'It is a reflection tool. If you feel unsafe, prioritise your safety and contact local emergency services or a trusted support service. SusMeter does not replace that.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. You can run a check without signing in. An account lets you save reports, see history and manage privacy settings.',
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <MarketingHeader />

      <main id="main-content">
        <section className="hero-grid relative overflow-hidden">
          <div className="container-page grid gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
            <div className="animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1.5 text-xs font-semibold text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Something feels sus?
              </div>

              <h1 className="max-w-3xl font-display text-[2.7rem] font-bold leading-[1.05] text-primary sm:text-6xl lg:text-[4.1rem]">
                Your Love Life Has a Bug. Let&apos;s Debug It.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Confused between green flags and emotional damage? Let AI help you examine the
                behaviour, not just the butterflies.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/quiz" className="btn-primary group">
                  Check the SusMeter
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#how-it-works" className="btn-secondary">
                  How It Works
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-healthy" /> No personality verdicts
                </span>
                <span className="flex items-center gap-2">
                  <ScanLine size={15} className="text-warning" /> Evidence stays visible
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles size={15} className="text-accent" /> Built for all relationship types
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <SignalMeter />
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-[#0C0C0E]">
          <div className="container-page grid gap-6 py-8 text-center sm:grid-cols-3">
            {[
              ['Behaviour, not character', 'We analyse what was said and done.'],
              ['Evidence, not vibes', 'Every signal comes with the wording behind it.'],
              ['Context, always', 'One message is never the whole story.'],
            ].map(([title, body]) => (
              <div key={title} className="px-4">
                <p className="font-display text-sm font-semibold text-primary">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="container-page scroll-mt-24 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="kicker">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
              Three steps from “hmm” to “okay, let me think.”
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              No pop psychology, no grand verdicts. Just a structured look at behaviours and the
              language around them.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="surface p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.08] text-accent">
                      <Icon size={19} />
                    </span>
                    <span className="font-display text-sm font-semibold text-zinc-600">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="what-it-checks" className="scroll-mt-24 border-y border-white/[0.06] bg-[#0C0C0E] py-20 sm:py-24">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="kicker">What it checks</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
                Eight areas. No gender assumptions.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                The same behaviour lens works for partners, friends, family and anyone else. Context
                decides what it means.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {questionBank.categories.map((category, index) => {
                const Icon = categoryIcons[index];
                return (
                  <div key={category.id} className="surface-soft p-5">
                    <Icon size={18} className="text-accent" />
                    <h3 className="mt-4 text-sm font-semibold text-primary">{category.label}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted">{category.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container-page py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="kicker">Text analyzer</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
                Paste the conversation. Keep the context.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                The analyzer highlights controlling language, boundary violations, disrespect,
                accountability, coercive pressure and healthy communication. Each finding keeps its
                supporting sentence attached.
              </p>
              <Link to="/analyze" className="btn-secondary mt-7">
                Open the analyzer <ArrowRight size={16} />
              </Link>
            </div>

            <div className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <p className="text-xs font-semibold text-zinc-400">Sample input</p>
                <span className="text-[10px] text-zinc-600">Illustration only</span>
              </div>
              <div className="p-5">
                <p className="rounded-xl border border-white/[0.06] bg-[#0D0D0F] p-4 text-sm leading-6 text-zinc-300">
                  “If you really cared, you wouldn&apos;t need to see your friends. Give me your
                  passwords so I can trust you.”
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Coercive language', className: 'border-accent/25 bg-accent/10 text-accent' },
                    { label: 'Controlling behaviour', className: 'border-warning/25 bg-warning/10 text-warning' },
                    { label: 'Boundary violations', className: 'border-warning/25 bg-warning/10 text-warning' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${item.className}`}
                    >
                      {item.label}
                      <span className="text-[10px] font-normal opacity-70">evidence attached</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="safety" className="scroll-mt-24 border-y border-white/[0.06] bg-[#0C0C0E] py-20 sm:py-24">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="kicker">Safety first</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">
                Not every red flag is a dealbreaker. {CONTEXT_NOTE}
              </h2>
            </div>
            <div className="surface p-6 sm:p-8">
              <p className="text-sm leading-7 text-zinc-300">
                SusMeter can help you organise what you noticed. It cannot verify facts, read minds,
                diagnose anyone, or tell you what to do next. A pattern that feels wrong is still
                worth taking seriously, even if a model stays quiet.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                If you feel unsafe, prioritise your safety and contact local emergency services or a
                trusted support service. Serious concerns deserve real-world help.
              </p>
            </div>
          </div>
        </section>

        <section className="container-page py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="kicker">Questions you might have</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
              Reasonable ones.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="surface-soft p-6">
                <h3 className="text-sm font-semibold text-primary">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page pb-24">
          <div className="surface relative overflow-hidden p-8 text-center sm:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_60%)]" />
            <div className="relative">
              <p className="font-display text-3xl font-bold text-primary sm:text-4xl">
                Run a behaviour check.
              </p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted">
                Let&apos;s inspect the evidence before your brain writes the whole script.
              </p>
              <Link to="/quiz" className="btn-primary mt-7">
                Check the SusMeter <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
