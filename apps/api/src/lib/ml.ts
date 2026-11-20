import { config } from '../config';
import { ApiError } from './http';

export interface MlResult {
  kind: 'quiz' | 'text';
  title: string;
  headline: string;
  summary: string;
  overallIndicator: 'green' | 'yellow' | 'red';
  categories: Array<{
    id: string;
    label: string;
    indicator: 'green' | 'yellow' | 'red';
    summary: string;
    detail: string;
    evidence: Array<{
      id: string;
      text: string;
      label: string;
      signal: 'low' | 'moderate' | 'strong';
      note?: string;
      source?: string;
    }>;
    limitations: string[];
  }>;
  strengths: string[];
  watchpoints: string[];
  limitations: string[];
  uncertainty: { level: 'low' | 'moderate' | 'high'; explanation: string };
  meta: Record<string, unknown>;
  safetyNote?: string;
}

export async function callMl<T>(endpoint: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.mlUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    throw new ApiError(
      503,
      'The analysis service is unavailable. Check that the ML service is running and try again.',
      { cause: error instanceof Error ? error.message : String(error) },
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(502, payload.error || 'The analysis service returned an error.');
  }

  return (await response.json()) as T;
}

export function analyzeQuiz(answers: Record<string, string>) {
  return callMl<MlResult>('/analyze/quiz', { answers });
}

export function analyzeText(text: string, context?: string) {
  return callMl<MlResult>('/analyze/text', { text, context });
}
