import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createPrismaClient } from './db/prisma.js';
import { RepositoryUnavailableError } from './lib/errors.js';
import { PrismaMessageRepository } from './repositories/prismaMessageRepository.js';
import { createMailer } from './services/mailer.js';
import { NotificationService } from './services/notificationService.js';

const config = loadConfig();
const logger = createLogger(config);

const prisma = createPrismaClient(config.databaseUrl);
const repository = new PrismaMessageRepository(prisma);

// Fail fast with an actionable message instead of accepting messages we cannot store.
try {
  await repository.ping();
} catch (error) {
  const hint =
    error instanceof RepositoryUnavailableError
      ? 'Cannot reach PostgreSQL or the schema is missing. Check DATABASE_URL and run "npm run db:migrate:deploy".'
      : 'Unexpected database error.';
  logger.fatal({ err: error }, hint);
  console.error(`\n${hint}\nSee docs/SETUP.md.\n`);
  process.exit(1);
}

const mailer = createMailer(config.email, config.siteName);
const notifications = new NotificationService(
  { repository, mailer, logger },
  { ...config.notifications, acknowledgeVisitors: config.acknowledgeVisitors },
);

const app = createApp({ config, logger, repository, notifications });
const server = app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      env: config.env,
      emailConfigured: mailer.configured,
      adminApi: config.adminApiToken !== null,
      servingClient: config.serveClient,
    },
    'portfolio API listening',
  );
  notifications.start();
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');
  notifications.stop();
  server.close(async () => {
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error({ err: reason }, 'unhandled rejection'));
