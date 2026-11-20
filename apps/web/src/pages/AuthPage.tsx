import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { errorMessage } from '@/lib/format';

interface AuthPageProps {
  mode: 'login' | 'register';
}

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        notify('Account ready. Let’s check something.', 'success');
      } else {
        await login(email, password);
        notify('Welcome back.', 'success');
      }
      navigate(redirectTo, { replace: true });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <Logo />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <p className="kicker">{isRegister ? 'Create your account' : 'Welcome back'}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">
            {isRegister ? 'Keep your checks in one place.' : 'Your evidence is waiting.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {isRegister
              ? 'Save reports, revisit findings and manage what SusMeter remembers.'
              : 'Sign in to see recent assessments, reports and your privacy settings.'}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="field-label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="What should we call you?"
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                spellCheck={false}
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 8 : 1}
                required
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              {isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            {isRegister ? 'Already have an account? ' : 'New here? '}
            <Link
              className="font-semibold text-accent hover:text-red-400"
              to={isRegister ? '/login' : '/register'}
              state={location.state}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>

          <p className="mt-3 text-xs text-zinc-600">
            Just looking?{' '}
            <Link className="text-zinc-400 hover:text-primary" to="/quiz">
              Run a check without an account
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-white/[0.06] bg-[#0C0C0E] lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative">
          <p className="font-display text-3xl font-bold leading-tight text-primary">
            Trust your gut. Verify with AI.
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted">
            A quieter way to examine what happened, keep the evidence attached, and remember that
            context decides the story.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            'Behaviour signals, not personality labels',
            'Green, yellow and red indicators with evidence',
            'Privacy controls you can actually use',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-healthy/20 bg-healthy/10">
                <Check size={14} className="text-healthy" />
              </span>
              {item}
            </div>
          ))}
        </div>
        <div className="relative flex items-center gap-2 text-xs text-zinc-600">
          <ShieldCheck size={14} /> Serious concerns deserve real-world support.
        </div>
      </div>
    </div>
  );
}
