import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import { ApiError, asyncHandler } from './http';

export interface AuthUser {
  id: string;
  email?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function readToken(req: Request): string | null {
  const cookieToken = req.cookies?.[config.cookieName];
  if (cookieToken) return cookieToken as string;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    if (!payload.sub || typeof payload.sub !== 'string') return null;
    return { id: payload.sub };
  } catch {
    return null;
  }
}

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = readToken(req);
    const user = token ? decodeToken(token) : null;
    if (!user) throw new ApiError(401, 'Sign in to continue.');
    req.user = user;
    next();
  },
);

export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = readToken(req);
    const user = token ? decodeToken(token) : null;
    if (user) req.user = user;
    next();
  },
);

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: config.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
