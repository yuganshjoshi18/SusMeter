import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { ApiError, asyncHandler } from '../lib/http';
import { prisma } from '../prisma';

export const reportsRouter = Router();

reportsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const reports = await prisma.report.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        assessment: {
          select: { id: true, type: true, title: true, createdAt: true, result: true },
        },
      },
    });

    res.json({
      items: reports.map((report) => ({
        id: report.id,
        summary: report.summary,
        createdAt: report.createdAt,
        assessmentId: report.assessmentId,
        type: report.assessment.type.toLowerCase(),
        title: report.assessment.title,
        indicator:
          (report.assessment.result as { overallIndicator?: string })?.overallIndicator || 'green',
      })),
    });
  }),
);

reportsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const report = await prisma.report.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { assessment: true },
    });
    if (!report) throw new ApiError(404, 'We could not find that report.');
    res.json(report);
  }),
);
