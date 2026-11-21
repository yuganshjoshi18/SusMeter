import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  // Render sets PORT automatically; local development keeps the fixed 4000 port.
  port: numberFromEnv(process.env.API_PORT || process.env.PORT, 4000),
  jwtSecret: process.env.JWT_SECRET || 'susmeter-development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mlUrl: (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, ''),
  // Comma-separated origins are supported so local dev and the deployed site
  // can both call the same API instance.
  webOrigin: (process.env.WEB_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',
  cookieName: 'susmeter_session',
};

if (!process.env.JWT_SECRET && config.isProduction) {
  throw new Error('JWT_SECRET must be set in production');
}
