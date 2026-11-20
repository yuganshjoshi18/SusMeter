import { Router } from 'express';
import { questionBank } from '@susmeter/shared';

export const questionsRouter = Router();

questionsRouter.get('/', (_req, res) => {
  res.json(questionBank);
});
