import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { AppConfig } from './config/env.js';
import type { Logger } from './config/logger.js';
import { createAdminRouter } from './routes/admin.js';
import { createContactRouter } from './routes/contact.js';
import { createHealthRouter } from './routes/health.js';
import { createErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createLimiter } from './middleware/rateLimit.js';
import { corsOriginFor, createOriginGuard, requireAdmin } from './middleware/security.js';
import type { MessageRepository } from './repositories/types.js';
import { ContactService } from './services/contactService.js';
import type { NotificationService } from './services/notificationService.js';

export interface AppDependencies {
  config: AppConfig;
  logger: Logger;
  repository: MessageRepository;
  notifications: NotificationService;
  now?: () => Date;
}

export function createApp({
  config,
  logger,
  repository,
  notifications,
  now,
}: AppDependencies): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use(
    pinoHttp({
      logger,
      genReqId: () => randomUUID(),
      // Deliberately no IP addresses, headers or bodies in access logs.
      serializers: {
        req: (req: { id: string; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url.split('?')[0],
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
      customLogLevel: (_req, res, err) =>
        err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      autoLogging: { ignore: (req) => req.url?.startsWith('/api/health') ?? false },
    }),
  );
  app.use(helmet());
  // gzip/deflate for text responses (HTML, JS, CSS, JSON). Skips already-compressed assets such as woff2/png.
  app.use(compression());

  // ---- API ---------------------------------------------------------------------------------
  const api = express.Router();
  api.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  api.use(
    cors((req, callback) =>
      callback(null, {
        origin: corsOriginFor(config.corsOrigins)(req),
        methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 600,
      }),
    ),
  );
  api.use(createOriginGuard(config.corsOrigins));
  api.use(
    createLimiter(
      config.rateLimit.api,
      'Too many requests. Please slow down and try again shortly.',
    ),
  );

  api.use('/health', createHealthRouter(repository));

  const contactService = new ContactService({ repository, notifications, logger, now });
  api.use(
    '/contact',
    createContactRouter(
      contactService,
      createLimiter(
        config.rateLimit.contact,
        'You have sent several messages recently. Please wait a while before trying again, or contact me directly by email.',
      ),
    ),
  );

  // Admin API exists only when ADMIN_API_TOKEN is configured; otherwise every admin route is a 404.
  api.use(
    '/admin',
    createAdminRouter({
      repository,
      emailConfigured: config.email !== null,
      guard: requireAdmin(config.adminApiToken),
      limiter: createLimiter(config.rateLimit.admin, 'Too many admin requests.'),
    }),
  );
  api.use(notFoundHandler);
  app.use('/api', api);

  // ---- Optional: serve the built React app from the same service ----------------------------
  if (config.serveClient) {
    const indexHtml = path.join(config.clientDistDir, 'index.html');
    if (!fs.existsSync(indexHtml)) {
      throw new Error(
        `SERVE_CLIENT=true but ${indexHtml} does not exist. Run "npm run build" first.`,
      );
    }
    app.use(
      express.static(config.clientDistDir, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // content-hashed
          } else if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }
        },
      }),
    );
    // SPA fallback for client-side routes. Paths that look like files (have an extension) are real 404s.
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (path.extname(req.path)) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  }
  app.use(notFoundHandler);

  app.use(createErrorHandler(logger));
  return app;
}
