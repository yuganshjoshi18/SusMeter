import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/85 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <a className="nav-link" href="/#how-it-works">
            How it works
          </a>
          <a className="nav-link" href="/#what-it-checks">
            What it checks
          </a>
          <a className="nav-link" href="/#safety">
            Safety first
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to="/dashboard" className="btn-secondary !px-4 !py-2.5">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link to="/quiz" className="btn-primary !px-4 !py-2.5">
                Check the SusMeter
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-primary md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-surface px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <a className="nav-link" href="/#how-it-works" onClick={() => setOpen(false)}>
              How it works
            </a>
            <a className="nav-link" href="/#what-it-checks" onClick={() => setOpen(false)}>
              What it checks
            </a>
            <a className="nav-link" href="/#safety" onClick={() => setOpen(false)}>
              Safety first
            </a>
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <Link to="/dashboard" className="btn-primary" onClick={() => setOpen(false)}>
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link to="/quiz" className="btn-primary" onClick={() => setOpen(false)}>
                    Check the SusMeter
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
