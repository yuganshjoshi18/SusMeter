import { Router } from 'express';
import { Prisma, type AssessmentType } from '@prisma/client';
import { z } from 'zod';
import { optionalAuth, requireAuth } from '../lib/auth';
import { ApiError, asyncHandler } from '../lib/http';
import { analyzeQuiz, analyzeText, type MlResult } from '../lib/ml';
import { resultIndicator, resultSummary, sanitizeResult } from '../lib/result';
import { prisma } from '../prisma';

export const assessmentsRouter = Router();

const quizSchema = z.object({
  answers: z.record(z.string(), z.string()).refine((value) => Object.keys(value).length > 0, {
    message: 'Answer at least one question.',
  }),
  context: z.string().trim().max(2000).optional(),
});

const textSchema = z.object({
  text: z.string().trim().min(12, 'Add at least a sentence or two.').max(12_000),
  context: z.string().trim().max(2000).optional(),
});

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function persist(
  userId: string | undefined,
  type: AssessmentType,
  title: string,
  input: unknown,
  result: MlResult,
) {
  if (!userId) return null;
  const settings = await prisma.privacySettings.findUnique({ where: { userId } });
  if (settings && !settings.storeAssessments) return null;

  return prisma.assessment.create({
    data: {
      userId,
      type,
      title,
      input: toInputJson(input),
      result: toInputJson(sanitizeResult(result)),
      report: {
        create: {
          userId,
          summary: resultSummary(result),
        },
      },
    },
  });
}

function listItem(assessment: {
  id: string;
  type: AssessmentType;
  title: string;
  createdAt: Date;
  result: Prisma.JsonValue;
}) {
  const result = assessment.result as unknown as MlResult;
  return {
    id: assessment.id,
    type: assessment.type.toLowerCase(),
    title: assessment.title,
    createdAt: assessment.createdAt,
    summary: result?.summary || 'Assessment complete.',
    indicator: resultIndicator(result),
  };
}

assessmentsRouter.post(
  '/quiz',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const input = quizSchema.parse(req.body);
    const result = await analyzeQuiz(input.answers);
    const assessment = await persist(
      req.user?.id,
      'QUIZ',
      result.title || 'Behaviour check',
      { answers: input.answers, context: input.context },
      result,
    );
    res.status(201).json({
      id: assessment?.id || null,
      saved: Boolean(assessment),
      result: sanitizeResult(result),
    });
  }),
);

assessmentsRouter.post(
  '/text',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const input = textSchema.parse(req.body);
    const result = await analyzeText(input.text, input.context);
    const assessment = await persist(
      req.user?.id,
      'TEXT',
      result.title || 'Conversation check',
      { text: input.text, context: input.context },
      result,
    );
    res.status(201).json({
      id: assessment?.id || null,
      saved: Boolean(assessment),
      result: sanitizeResult(result),
    });
  }),
);

assessmentsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const type = typeof req.query.type === 'string' ? req.query.type.toUpperCase() : undefined;
    const where: Prisma.AssessmentWhereInput = { userId: req.user!.id };
    if (type === 'QUIZ' || type === 'TEXT') where.type = type;

    const rows = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ items: rows.map(listItem) });
  }),
);

assessmentsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const assessment = await prisma.assessment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { report: true },
    });
    if (!assessment) throw new ApiError(404, 'We could not find that assessment.');
    res.json({
      id: assessment.id,
      type: assessment.type.toLowerCase(),
      title: assessment.title,
      createdAt: assessment.createdAt,
      input: assessment.input,
      result: assessment.result,
      report: assessment.report,
    });
  }),
);

assessmentsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deleted = await prisma.assessment.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (deleted.count === 0) throw new ApiError(404, 'We could not find that assessment.');
    res.json({ ok: true });
  }),
);
