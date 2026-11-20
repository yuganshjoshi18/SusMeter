import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  linked?: boolean;
  showWordmark?: boolean;
}

const markSize = {
  sm: 28,
  md: 34,
  lg: 42,
};

const textSize = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimension = markSize[size];
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 64 64"
      role="img"
      aria-label="SusMeter flag radar mark"
      className="shrink-0"
    >
      <rect width="64" height="64" rx="16" fill="#111113" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" />
      <circle cx="29" cy="35" r="20" fill="none" stroke="#EF4444" strokeOpacity="0.22" strokeWidth="2" />
      <circle cx="29" cy="35" r="12" fill="none" stroke="#EF4444" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M29 12v42" stroke="#FAFAFA" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30.5 14c7.5 2.5 13 4.5 18 3.5l-3.5 11c-5.5 1-10.5-1-14.5-3" fill="#EF4444" />
      <circle cx="29" cy="35" r="3" fill="#F97316" />
    </svg>
  );
}

export function Logo({ size = 'md', linked = true, showWordmark = true }: LogoProps) {
  const content = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {showWordmark && (
        <span className={`font-display font-bold tracking-tight text-primary ${textSize[size]}`}>
          Sus<span className="text-accent">Meter</span>
        </span>
      )}
    </span>
  );

  if (!linked) return content;
  return (
    <Link to="/" aria-label="SusMeter home" className="inline-flex rounded-lg">
      {content}
    </Link>
  );
}
