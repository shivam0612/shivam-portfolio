import { rateLimit } from 'express-rate-limit';
import type { RateLimitConfig } from '../config/env.js';

/** In-memory, per-IP limiter. Behind a proxy, set TRUST_PROXY so the real client IP is used. */
export function createLimiter(config: RateLimitConfig, message: string) {
  return rateLimit({
    windowMs: config.windowMs,
    limit: config.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      const retryAfter = Number(res.getHeader('Retry-After'));
      res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message,
        ...(Number.isFinite(retryAfter) && retryAfter > 0 ? { retryAfterSeconds: retryAfter } : {}),
      });
    },
  });
}
