import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { CONTEXT_NOTE } from '@/lib/brand';

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0C0C0E]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            A behaviour-checking tool for people who would rather examine evidence than spiral at 2am.
          </p>
          <p className="mt-3 text-xs text-zinc-600">Trust your gut. Verify with AI.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">Product</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <Link className="hover:text-primary" to="/quiz">
              Behaviour quiz
            </Link>
            <Link className="hover:text-primary" to="/analyze">
              Text analyzer
            </Link>
            <Link className="hover:text-primary" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">Good to know</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
            <Link className="hover:text-primary" to="/privacy">
              Privacy settings
            </Link>
            <a className="hover:text-primary" href="/#safety">
              Safety note
            </a>
            <span className="text-zinc-600">{CONTEXT_NOTE}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SusMeter. Built for clearer conversations.</p>
          <p>Behavioural signals, not verdicts on people.</p>
        </div>
      </div>
    </footer>
  );
}
