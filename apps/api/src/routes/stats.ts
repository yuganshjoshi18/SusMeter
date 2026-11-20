import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler } from '../lib/http';
import { prisma } from '../prisma';

export const statsRouter = Router();

statsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [user, assessments, reportCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { createdAt: true },
      }),
      prisma.assessment.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where: { userId: req.user!.id } }),
    ]);

    const indicatorCounts = { green: 0, yellow: 0, red: 0 };
    const categoryCounts = new Map<string, number>();

    for (const assessment of assessments) {
      const result = assessment.result as {
        overallIndicator?: string;
        categories?: Array<{ id: string }>;
      };
      if (result?.overallIndicator && result.overallIndicator in indicatorCounts) {
        indicatorCounts[result.overallIndicator as keyof typeof indicatorCounts] += 1;
      }
      for (const category of result?.categories || []) {
        categoryCounts.set(category.id, (categoryCounts.get(category.id) || 0) + 1);
      }
    }

    const mostCheckedCategory =
      [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      totalAssessments: assessments.length,
      totalReports: reportCount,
      quizCount: assessments.filter((item) => item.type === 'QUIZ').length,
      textCount: assessments.filter((item) => item.type === 'TEXT').length,
      indicatorCounts,
      mostCheckedCategory,
      lastAssessmentAt: assessments[0]?.createdAt || null,
      memberSince: user?.createdAt || null,
    });
  }),
);
