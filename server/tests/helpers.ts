import { pino } from 'pino';
import { createApp } from '../src/app.js';
import { parseConfig, type AppConfig } from '../src/config/env.js';
import { InMemoryMessageRepository } from '../src/repositories/inMemoryMessageRepository.js';
import type { StoredContactMessage } from '../src/repositories/types.js';
import { UnconfiguredMailer, type Mailer } from '../src/services/mailer.js';
import { NotificationService } from '../src/services/notificationService.js';

export const ADMIN_TOKEN = 'a'.repeat(40);

export const validPayload = {
  name: 'Jordan Rivera',
  email: 'jordan@example.com',
  organization: 'Example Logistics',
  subject: 'Operations analyst opening',
  inquiryType: 'Professional Opportunity',
  message: 'We would like to talk about a role on our distribution operations team.',
  consent: true,
};

export class FakeMailer implements Mailer {
  configured = true;
  owner: StoredContactMessage[] = [];
  acknowledgements: StoredContactMessage[] = [];
  failOwnerWith: Error | null = null;
  failAckWith: Error | null = null;

  async sendOwnerNotification(msg: StoredContactMessage) {
    if (this.failOwnerWith) throw this.failOwnerWith;
    this.owner.push(msg);
  }
  async sendVisitorAcknowledgement(msg: StoredContactMessage) {
    if (this.failAckWith) throw this.failAckWith;
    this.acknowledgements.push(msg);
  }
}

export function makeClock(start = '2026-10-11T12:00:00.000Z') {
  let t = new Date(start).getTime();
  return { now: () => new Date(t), advance: (ms: number) => (t += ms) };
}

export function makeConfig(overrides: Record<string, string> = {}): AppConfig {
  return parseConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
    SMTP_HOST: 'smtp.example.test',
    CONTACT_NOTIFICATION_EMAIL: 'owner@example.test',
    CONTACT_FROM_EMAIL: 'Portfolio <no-reply@example.test>',
    ...overrides,
  });
}

export function buildTestApp(opts: { env?: Record<string, string>; mailer?: Mailer } = {}) {
  const config = makeConfig(opts.env);
  const clock = makeClock();
  const logger = pino({ level: 'silent' });
  const repository = new InMemoryMessageRepository(clock.now);
  const mailer = opts.mailer ?? new FakeMailer();
  const notifications = new NotificationService(
    { repository, mailer, logger },
    { ...config.notifications, acknowledgeVisitors: config.acknowledgeVisitors, now: clock.now },
  );
  const app = createApp({ config, logger, repository, notifications, now: clock.now });
  return { app, config, clock, logger, repository, mailer, notifications };
}

export { UnconfiguredMailer };
