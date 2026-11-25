import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string | null;
  pass: string | null;
  timeoutMs: number;
  /** Where owner notifications are delivered. */
  notifyTo: string;
  /** Verified sender address used in the From header. */
  from: string;
}

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  databaseUrl: string;
  corsOrigins: string[];
  trustProxy: number;
  serveClient: boolean;
  clientDistDir: string;
  rateLimit: { contact: RateLimitConfig; api: RateLimitConfig; admin: RateLimitConfig };
  email: EmailConfig | null;
  acknowledgeVisitors: boolean;
  notifications: { retryIntervalMs: number; maxAttempts: number; leaseMs: number };
  adminApiToken: string | null;
  siteName: string;
}

export class ConfigError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Invalid server configuration:\n - ${problems.join('\n - ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

const serverRoot = fileURLToPath(new URL('../../', import.meta.url));

// Empty strings in .env files (e.g. `SMTP_HOST=`) are treated as "not set".
const blank = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const text = () => z.preprocess(blank, z.string().trim().optional());
const flag = (fallback: boolean) =>
  z.preprocess(
    blank,
    z
      .enum(['true', 'false'], { error: 'must be "true" or "false"' })
      .default(fallback ? 'true' : 'false')
      .transform((v) => v === 'true'),
  );
const int = (fallback: number, min: number, max: number) =>
  z.preprocess(blank, z.coerce.number().int().min(min).max(max).default(fallback));

const envSchema = z.object({
  NODE_ENV: z.preprocess(
    blank,
    z.enum(['development', 'test', 'production']).default('development'),
  ),
  PORT: int(4000, 1, 65535),
  LOG_LEVEL: z.preprocess(
    blank,
    z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  ),
  DATABASE_URL: z
    .string({ error: 'is required (PostgreSQL connection string)' })
    .trim()
    .refine((v) => /^postgres(ql)?:\/\//.test(v), 'must start with postgresql://'),
  CORS_ORIGINS: z.preprocess(blank, z.string().default('http://localhost:5173')),
  TRUST_PROXY: int(0, 0, 10),
  SERVE_CLIENT: flag(false),
  CLIENT_DIST_DIR: z.preprocess(blank, z.string().default('../client/dist')),
  CONTACT_RATE_LIMIT_MAX: int(5, 1, 1000),
  CONTACT_RATE_LIMIT_WINDOW_MINUTES: int(15, 1, 1440),
  API_RATE_LIMIT_MAX: int(300, 1, 100000),
  API_RATE_LIMIT_WINDOW_MINUTES: int(15, 1, 1440),
  SMTP_HOST: text(),
  SMTP_PORT: int(587, 1, 65535),
  SMTP_SECURE: flag(false),
  SMTP_USER: text(),
  SMTP_PASS: z.preprocess(blank, z.string().optional()),
  SMTP_TIMEOUT_MS: int(8000, 1000, 60000),
  CONTACT_NOTIFICATION_EMAIL: text(),
  CONTACT_FROM_EMAIL: text(),
  CONTACT_SEND_ACKNOWLEDGEMENT: flag(false),
  NOTIFICATION_RETRY_INTERVAL_SECONDS: int(60, 5, 3600),
  NOTIFICATION_MAX_ATTEMPTS: int(8, 1, 50),
  ADMIN_API_TOKEN: z.preprocess(
    blank,
    z.string().min(32, 'must be at least 32 characters').optional(),
  ),
  SITE_NAME: z.preprocess(blank, z.string().default('Shivam Patel Portfolio')),
});

const emailLike = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const fromLike = /^(?:[^<>\r\n]+<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;

/** Parse and validate environment variables. Throws ConfigError listing every problem. */
export function parseConfig(raw: NodeJS.ProcessEnv): AppConfig {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ConfigError(
      parsed.error.issues.map((i) => `${i.path.join('.') || 'env'}: ${i.message}`),
    );
  }
  const e = parsed.data;
  const problems: string[] = [];

  const emailFields = {
    SMTP_HOST: e.SMTP_HOST,
    CONTACT_NOTIFICATION_EMAIL: e.CONTACT_NOTIFICATION_EMAIL,
    CONTACT_FROM_EMAIL: e.CONTACT_FROM_EMAIL,
  };
  const provided = Object.entries(emailFields).filter(([, v]) => v);
  let email: EmailConfig | null = null;
  if (provided.length > 0 && provided.length < 3) {
    const missing = Object.entries(emailFields)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    problems.push(
      `Email notifications are partially configured. Missing: ${missing.join(', ')} ` +
        '(set all three, or leave all unset to keep notifications pending).',
    );
  } else if (provided.length === 3) {
    if (Boolean(e.SMTP_USER) !== Boolean(e.SMTP_PASS)) {
      problems.push('SMTP_USER and SMTP_PASS must be set together.');
    }
    if (!emailLike.test(e.CONTACT_NOTIFICATION_EMAIL!)) {
      problems.push('CONTACT_NOTIFICATION_EMAIL must be a valid e-mail address.');
    }
    if (!fromLike.test(e.CONTACT_FROM_EMAIL!)) {
      problems.push('CONTACT_FROM_EMAIL must be an address or "Name <address>".');
    }
    email = {
      host: e.SMTP_HOST!,
      port: e.SMTP_PORT,
      secure: e.SMTP_SECURE,
      user: e.SMTP_USER ?? null,
      pass: e.SMTP_PASS ?? null,
      timeoutMs: e.SMTP_TIMEOUT_MS,
      notifyTo: e.CONTACT_NOTIFICATION_EMAIL!,
      from: e.CONTACT_FROM_EMAIL!,
    };
  }
  if (e.CONTACT_SEND_ACKNOWLEDGEMENT && !email) {
    problems.push('CONTACT_SEND_ACKNOWLEDGEMENT=true requires the SMTP settings to be configured.');
  }
  if (problems.length > 0) throw new ConfigError(problems);

  const corsOrigins = e.CORS_ORIGINS.split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return {
    env: e.NODE_ENV,
    port: e.PORT,
    logLevel: e.LOG_LEVEL,
    databaseUrl: e.DATABASE_URL,
    corsOrigins,
    trustProxy: e.TRUST_PROXY,
    serveClient: e.SERVE_CLIENT,
    clientDistDir: path.resolve(serverRoot, e.CLIENT_DIST_DIR),
    rateLimit: {
      contact: {
        max: e.CONTACT_RATE_LIMIT_MAX,
        windowMs: e.CONTACT_RATE_LIMIT_WINDOW_MINUTES * 60_000,
      },
      api: { max: e.API_RATE_LIMIT_MAX, windowMs: e.API_RATE_LIMIT_WINDOW_MINUTES * 60_000 },
      admin: { max: 30, windowMs: 15 * 60_000 },
    },
    email,
    acknowledgeVisitors: e.CONTACT_SEND_ACKNOWLEDGEMENT,
    notifications: {
      retryIntervalMs: e.NOTIFICATION_RETRY_INTERVAL_SECONDS * 1000,
      maxAttempts: e.NOTIFICATION_MAX_ATTEMPTS,
      leaseMs: Math.max(60_000, e.SMTP_TIMEOUT_MS * 3),
    },
    adminApiToken: e.ADMIN_API_TOKEN ?? null,
    siteName: e.SITE_NAME,
  };
}

/** Load configuration for the running server; prints a clear setup error and exits on failure. */
export function loadConfig(): AppConfig {
  try {
    return parseConfig(process.env);
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(
        `\n${error.message}\n\nSee server/.env.example and docs/SETUP.md for the required variables.\n`,
      );
      process.exit(1);
    }
    throw error;
  }
}
