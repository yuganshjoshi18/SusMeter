import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../lib/auth';
import { asyncHandler } from '../lib/http';
import { prisma } from '../prisma';

export const settingsRouter = Router();

const updateSchema = z.object({
  storeAssessments: z.boolean().optional(),
  allowAnalytics: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
});

async function getOrCreateSettings(userId: string) {
  return prisma.privacySettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

settingsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await getOrCreateSettings(req.user!.id));
  }),
);

settingsRouter.patch(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateSchema.parse(req.body);
    await getOrCreateSettings(req.user!.id);
    const updated = await prisma.privacySettings.update({
      where: { userId: req.user!.id },
      data: input,
    });
    res.json(updated);
  }),
);

settingsRouter.delete(
  '/data',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [assessments, reports] = await Promise.all([
      prisma.assessment.deleteMany({ where: { userId: req.user!.id } }),
      prisma.report.deleteMany({ where: { userId: req.user!.id } }),
    ]);
    res.json({ ok: true, deletedAssessments: assessments.count, deletedReports: reports.count });
  }),
);
