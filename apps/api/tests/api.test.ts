import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('SusMeter API', () => {
  it('exposes a health endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', service: 'susmeter-api' });
  });

  it('returns a clear 404 for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.error).toContain('does not exist');
  });

  it('requires a session for personal history', async () => {
    const response = await request(app).get('/api/assessments');
    expect(response.status).toBe(401);
  });

  it('validates quiz payloads before calling the ML service', async () => {
    const response = await request(app).post('/api/assessments/quiz').send({ answers: {} });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
