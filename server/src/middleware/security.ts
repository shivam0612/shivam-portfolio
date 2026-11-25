import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { AppError } from '../lib/errors.js';

export function isAllowedOrigin(
  origin: string,
  host: string | undefined,
  allowed: string[],
): boolean {
  if (allowed.includes(origin.replace(/\/$/, ''))) return true;
  try {
    return host !== undefined && new URL(origin).host === host; // same-origin deployment
  } catch {
    return false;
  }
}

/** Resolves the CORS origin decision for a request (used by the `cors` middleware). */
export const corsOriginFor = (allowed: string[]) => (req: Request) => {
  const origin = req.get('origin');
  return Boolean(origin && isAllowedOrigin(origin, req.get('host'), allowed));
};

/**
 * Browsers always send an Origin header on cross-site writes. Reject state-changing requests from
 * origins that are not approved; requests without Origin (curl, server-to-server) are unaffected.
 */
export function createOriginGuard(allowed: string[]): RequestHandler {
  return (req, _res, next) => {
    const origin = req.get('origin');
    if (!origin || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (isAllowedOrigin(origin, req.get('host'), allowed)) return next();
    next(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'This origin is not allowed to submit requests.'));
  };
}

/** Bearer-token guard for the admin API. If no token is configured the admin API does not exist. */
export function requireAdmin(token: string | null): RequestHandler {
  const expected = token ? createHash('sha256').update(token).digest() : null;
  return (req, res, next) => {
    if (!expected)
      return next(new AppError(404, 'NOT_FOUND', 'The requested resource was not found.'));
    const match = /^Bearer (.+)$/.exec(req.get('authorization') ?? '');
    const provided = createHash('sha256')
      .update(match?.[1] ?? '')
      .digest();
    if (!match || !timingSafeEqual(provided, expected)) {
      res.setHeader('WWW-Authenticate', 'Bearer realm="portfolio-admin"');
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required.'));
    }
    next();
  };
}
