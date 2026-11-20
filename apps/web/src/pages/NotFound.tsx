import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <div className="container-page py-8">
        <Logo />
      </div>
      <div className="container-page flex flex-1 flex-col items-center justify-center pb-24 text-center">
        <p className="kicker">404 · Nothing to see here</p>
        <h1 className="mt-4 font-display text-5xl font-bold text-primary sm:text-6xl">Page not found.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted">
          This route went quiet. The good news: your love life and our navigation are separate
          problems.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Back to SusMeter
        </Link>
      </div>
    </div>
  );
}
