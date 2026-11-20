import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorMiddleware } from './lib/http';
import { assessmentsRouter } from './routes/assessments';
import { authRouter } from './routes/auth';
import { questionsRouter } from './routes/questions';
import { reportsRouter } from './routes/reports';
import { settingsRouter } from './routes/settings';
import { statsRouter } from './routes/stats';

export const app = express();

app.set('trust proxy', config.isProduction ? 1 : false);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'susmeter-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/model/info', async (_req, res, next) => {
  try {
    const response = await fetch(`${config.mlUrl}/model/info`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('ML service returned an error');
    res.json(await response.json());
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/questions', questionsRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'That API route does not exist.' });
});

app.use(errorMiddleware);
