import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AssessmentResult } from '@susmeter/shared';
import { Logo } from '@/components/Logo';
import { ResultView } from '@/components/ResultView';
import { StatusPill } from '@/components/StatusPill';
import { formatRelative } from '@/lib/format';

const result: AssessmentResult = {
  kind: 'text',
  title: 'Conversation check',
  headline: 'Your results are ready.',
  summary: 'Not every red flag is a dealbreaker. Context matters. Always.',
  overallIndicator: 'yellow',
  categories: [
    {
      id: 'controlling',
      label: 'Controlling behaviour',
      indicator: 'yellow',
      summary: 'Worth reviewing.',
      detail: 'Language that sets rules about ordinary choices.',
      evidence: [
        {
          id: 'e1',
          text: 'Give me your passwords.',
          label: 'Controlling behaviour',
          signal: 'moderate',
        },
      ],
      limitations: ['Self-reported text only.'],
    },
  ],
  strengths: [],
  watchpoints: ['Controlling behaviour'],
  limitations: ['The model reads wording, not intent.'],
  uncertainty: { level: 'moderate', explanation: 'One passage only.' },
  meta: { engine: 'text-signals-1.0.0', generatedAt: '2026-01-01T00:00:00.000Z' },
};

describe('branding', () => {
  it('renders the SusMeter wordmark', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>,
    );
    const logo = screen.getByLabelText('SusMeter home');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveTextContent('SusMeter');
  });
});

describe('status pill', () => {
  it('accepts both indicators and qualitative signal levels', () => {
    render(
      <>
        <StatusPill indicator="green" />
        <StatusPill level="strong" />
      </>,
    );
    expect(screen.getByText('Green flag')).toBeInTheDocument();
    expect(screen.getByText('Red flag')).toBeInTheDocument();
  });
});

describe('result view', () => {
  it('shows indicators, evidence and limitations without numeric scores', () => {
    render(<ResultView result={result} />);
    expect(screen.getByText('Your results are ready.')).toBeInTheDocument();
    expect(screen.getByText('Controlling behaviour')).toBeInTheDocument();
    expect(screen.getByText(/Give me your passwords/)).toBeInTheDocument();
    expect(screen.getByText('Assessment limitations')).toBeInTheDocument();
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
  });
});

describe('formatting', () => {
  it('formats recent timestamps relatively', () => {
    expect(formatRelative(new Date(Date.now() - 60_000).toISOString())).toMatch(/ago|Just now/);
  });
});
