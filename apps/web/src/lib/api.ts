import type { AssessmentResult } from '@susmeter/shared';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (payload as { error?: string } | null)?.error ||
      'That did not go through. Try again in a moment.';
    throw new ApiRequestError(message, response.status, payload);
  }
  return payload as T;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AssessmentListItem {
  id: string;
  type: 'quiz' | 'text';
  title: string;
  createdAt: string;
  summary: string;
  indicator: 'green' | 'yellow' | 'red';
}

export interface AssessmentDetail {
  id: string;
  type: 'quiz' | 'text';
  title: string;
  createdAt: string;
  input: unknown;
  result: AssessmentResult;
  report: { id: string; summary: string; createdAt: string } | null;
}

export interface ReportItem {
  id: string;
  summary: string;
  createdAt: string;
  assessmentId: string;
  type: 'quiz' | 'text';
  title: string;
  indicator: 'green' | 'yellow' | 'red';
}

export interface UserStats {
  totalAssessments: number;
  totalReports: number;
  quizCount: number;
  textCount: number;
  indicatorCounts: { green: number; yellow: number; red: number };
  mostCheckedCategory: string | null;
  lastAssessmentAt: string | null;
  memberSince: string | null;
}

export interface PrivacySettings {
  storeAssessments: boolean;
  allowAnalytics: boolean;
  emailNotifications: boolean;
  updatedAt?: string;
}

export interface AssessmentResponse {
  id: string | null;
  saved: boolean;
  result: AssessmentResult;
}

export const api = {
  auth: {
    me: () => request<{ user: ApiUser }>('/auth/me'),
    updateName: (name: string) =>
      request<{ user: ApiUser }>('/auth/me', { method: 'PATCH', body: { name } }),
    login: (email: string, password: string) =>
      request<{ user: ApiUser }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    register: (name: string, email: string, password: string) =>
      request<{ user: ApiUser }>('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      }),
    logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  },
  assessments: {
    quiz: (answers: Record<string, string>, context?: string) =>
      request<AssessmentResponse>('/assessments/quiz', {
        method: 'POST',
        body: { answers, context },
      }),
    text: (text: string, context?: string) =>
      request<AssessmentResponse>('/assessments/text', {
        method: 'POST',
        body: { text, context },
      }),
    list: (limit = 10, type?: 'quiz' | 'text') =>
      request<{ items: AssessmentListItem[] }>(
        `/assessments?limit=${limit}${type ? `&type=${type}` : ''}`,
      ),
    get: (id: string) => request<AssessmentDetail>(`/assessments/${id}`),
    remove: (id: string) =>
      request<{ ok: boolean }>(`/assessments/${id}`, { method: 'DELETE' }),
  },
  reports: {
    list: () => request<{ items: ReportItem[] }>('/reports'),
  },
  stats: {
    get: () => request<UserStats>('/stats'),
  },
  settings: {
    get: () => request<PrivacySettings>('/settings'),
    update: (input: Partial<PrivacySettings>) =>
      request<PrivacySettings>('/settings', { method: 'PATCH', body: input }),
    deleteData: () =>
      request<{ ok: boolean; deletedAssessments: number; deletedReports: number }>(
        '/settings/data',
        { method: 'DELETE' },
      ),
  },
};
