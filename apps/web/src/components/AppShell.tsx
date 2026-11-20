import { useState } from 'react';
import {
  ChevronRight,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quiz', label: 'Behaviour quiz', icon: ClipboardList },
  { to: '/analyze', label: 'Text analyzer', icon: MessageSquareText },
  { to: '/results', label: 'Results', icon: ScanLine },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/privacy', label: 'Privacy', icon: ShieldCheck },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/quiz': 'Behaviour quiz',
  '/analyze': 'Text analyzer',
  '/results': 'Results',
  '/history': 'History',
  '/profile': 'Profile',
  '/privacy': 'Privacy settings',
};

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/results/')
      ? 'Assessment result'
      : 'SusMeter');

  const handleLogout = async () => {
    await logout();
    notify('Signed out. Your gut is still here.', 'success');
    navigate('/');
  };

  const navItems = (
    <nav className="flex flex-col gap-1" aria-label="Application navigation">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-primary ring-1 ring-inset ring-accent/20'
                  : 'text-muted hover:bg-white/[0.045] hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-accent' : 'text-zinc-500 group-hover:text-zinc-300'} />
                <span className="flex-1">{item.label}</span>
                {isActive && <span className="h-1 w-1 rounded-full bg-accent" />}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0C0C0E] px-5 py-6 lg:flex">
        <div className="px-1">
          <Logo />
        </div>
        <div className="mt-10 flex-1">{navItems}</div>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-accent/[0.09] to-transparent p-4">
          <p className="text-sm font-semibold text-primary">Something feels sus?</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Run a behaviour check and look at the evidence, not just the butterflies.
          </p>
          <NavLink to="/analyze" className="mt-3 inline-flex text-xs font-semibold text-accent hover:text-red-400">
            Analyze a conversation →
          </NavLink>
        </div>
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-primary"
          >
            <LogOut size={17} />
            Sign out
          </button>
        )}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/70"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] border-r border-white/[0.08] bg-[#0C0C0E] px-5 py-6">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-white/5"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-10">{navItems}</div>
            {user && (
              <button type="button" onClick={handleLogout} className="btn-ghost mt-6 w-full justify-start">
                <LogOut size={16} /> Sign out
              </button>
            )}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-ink/85 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-muted hover:bg-white/5 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
            <div className="hidden items-center gap-2 text-sm text-muted lg:flex">
              <span>SusMeter</span>
              <ChevronRight size={14} className="text-zinc-700" />
              <span className="font-medium text-primary">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-600 sm:inline">Trust your gut. Verify with AI.</span>
            {user ? (
              <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate text-xs text-zinc-300 sm:block">
                  {user.name || user.email}
                </span>
              </div>
            ) : (
              <NavLink to="/login" className="btn-secondary !px-3 !py-2 text-xs">
                Sign in
              </NavLink>
            )}
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
