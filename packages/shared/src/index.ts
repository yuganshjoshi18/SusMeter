import bank from './questions.json';

export type Indicator = 'green' | 'yellow' | 'red';
export type Signal = 'low' | 'moderate' | 'strong';
export type AssessmentKind = 'quiz' | 'text';

export interface QuestionOption {
  id: string;
  label: string;
  description: string;
  weight: number;
  note: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  prompt: string;
  hint: string;
  options: QuestionOption[];
}

export interface CategoryMeta {
  id: string;
  label: string;
  description: string;
  healthySignal: string;
  watchSignal: string;
}

export interface QuestionBank {
  version: string;
  categories: CategoryMeta[];
  questions: QuizQuestion[];
}

export interface Evidence {
  id: string;
  text: string;
  label: string;
  signal: Signal;
  note?: string;
  source?: string;
}

export interface CategoryFinding {
  id: string;
  label: string;
  indicator: Indicator;
  summary: string;
  detail: string;
  evidence: Evidence[];
  limitations: string[];
}

export interface AssessmentResult {
  kind: AssessmentKind;
  title: string;
  headline: string;
  summary: string;
  overallIndicator: Indicator;
  categories: CategoryFinding[];
  strengths: string[];
  watchpoints: string[];
  limitations: string[];
  uncertainty: {
    level: 'low' | 'moderate' | 'high';
    explanation: string;
  };
  meta: {
    engine: string;
    modelVersion?: string;
    answeredQuestions?: number;
    totalQuestions?: number;
    analyzedCharacters?: number;
    context?: string | null;
    generatedAt: string;
  };
  safetyNote?: string;
}

export const questionBank = bank as QuestionBank;

export function getQuestionBank(): QuestionBank {
  return questionBank;
}

export function getCategory(id: string): CategoryMeta | undefined {
  return questionBank.categories.find((category) => category.id === id);
}

export function getQuestion(id: string): QuizQuestion | undefined {
  return questionBank.questions.find((question) => question.id === id);
}

export function getOption(questionId: string, optionId: string): QuestionOption | undefined {
  return getQuestion(questionId)?.options.find((option) => option.id === optionId);
}

/** Maps an averaged 0–3 rubric weight to a qualitative indicator. */
export function indicatorFromWeightedAverage(average: number): Indicator {
  if (average < 1.2) return 'green';
  if (average < 2.2) return 'yellow';
  return 'red';
}

export function indicatorLabel(indicator: Indicator): string {
  if (indicator === 'green') return 'Healthier signal';
  if (indicator === 'yellow') return 'Needs context';
  return 'Worth a closer look';
}

export function indicatorDescription(indicator: Indicator): string {
  if (indicator === 'green') return 'Reported behaviour in this area looks steady and respectful.';
  if (indicator === 'yellow') return 'Mixed signals here. Patterns and context matter more than one example.';
  return 'Several reported behaviours in this area deserve careful attention.';
}

export const SAFETY_NOTE =
  'This tool examines reported behaviour, not character or intent. It cannot verify what happened, diagnose anyone, or replace safety planning. If you feel unsafe, contact local emergency services or a trusted support service.';

export const CONTEXT_NOTE = 'Context matters. Always.';
