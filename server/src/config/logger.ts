import pino, { type Logger } from 'pino';
import type { AppConfig } from './env.js';

export type { Logger };

/** Structured JSON logger. Secrets and personal data are redacted or never logged. */
export function createLogger(config: Pick<AppConfig, 'logLevel' | 'env'>): Logger {
  return pino({
    level: config.logLevel,
    base: { service: 'portfolio-api' },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'pass',
        '*.password',
        '*.pass',
        'smtp.pass',
        'email',
        'message',
      ],
      censor: '[redacted]',
    },
  });
}
