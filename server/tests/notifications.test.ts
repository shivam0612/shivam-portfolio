import { describe, expect, it } from 'vitest';
import { InMemoryMessageRepository } from '../src/repositories/inMemoryMessageRepository.js';
import { UnconfiguredMailer } from '../src/services/mailer.js';
import { NotificationService, backoffMs } from '../src/services/notificationService.js';
import { pino } from 'pino';
import { FakeMailer, makeClock } from './helpers.js';

const logger = pino({ level: 'silent' });
const base = {
  name: 'A B',
  email: 'a@b.co',
  organization: null,
  subject: 'Hello there',
  inquiryType: 'General Inquiry',
  message: 'Hello, this is a message.',
  consent: true as const,
};

function setup(maxAttempts = 3) {
  const clock = makeClock();
  const repository = new InMemoryMessageRepository(clock.now);
  const mailer = new FakeMailer();
  const service = new NotificationService(
    { repository, mailer, logger },
    {
      maxAttempts,
      leaseMs: 60_000,
      retryIntervalMs: 60_000,
      acknowledgeVisitors: false,
      now: clock.now,
    },
  );
  const add = async (n: number) =>
    (await repository.create({ ...base, reference: `SP-AAAAA${n}-BBBBB${n}`, dedupeKey: `k${n}` }))
      .message;
  return { clock, repository, mailer, service, add };
}

describe('notification outbox', () => {
  it('retries a failed notification with back-off and eventually delivers it', async () => {
    const { clock, repository, mailer, service, add } = setup();
    const msg = await add(1);
    mailer.failOwnerWith = new Error('temporary failure');

    expect(await service.dispatch(msg.id)).toBe('retry');
    expect(repository.rows[0]).toMatchObject({
      notificationStatus: 'PENDING',
      notificationAttempts: 1,
    });

    // Not due yet → the worker leaves it alone.
    expect(await service.runOnce()).toBe(0);
    expect(mailer.owner).toHaveLength(0);

    mailer.failOwnerWith = null;
    clock.advance(backoffMs(1) + 1);
    expect(await service.runOnce()).toBe(1);
    expect(repository.rows[0]).toMatchObject({
      notificationStatus: 'SENT',
      notificationAttempts: 2,
      notificationLastError: null,
    });
    expect(mailer.owner).toHaveLength(1);
  });

  it('marks a notification FAILED after the maximum number of attempts, keeping the message', async () => {
    const { clock, repository, mailer, service, add } = setup(2);
    const msg = await add(1);
    mailer.failOwnerWith = new Error('still down');

    await service.dispatch(msg.id);
    clock.advance(backoffMs(1) + 1);
    expect(await service.dispatch(msg.id)).toBe('failed');
    expect(repository.rows).toHaveLength(1);
    expect(repository.rows[0]).toMatchObject({
      notificationStatus: 'FAILED',
      notificationAttempts: 2,
      notificationNextAttemptAt: null,
    });
    expect(await service.runOnce()).toBe(0); // permanent failures are not retried automatically
  });

  it('delivers the backlog once SMTP becomes configured', async () => {
    const clock = makeClock();
    const repository = new InMemoryMessageRepository(clock.now);
    const opts = {
      maxAttempts: 3,
      leaseMs: 60_000,
      retryIntervalMs: 60_000,
      acknowledgeVisitors: false,
      now: clock.now,
    };
    for (const n of [1, 2])
      await repository.create({ ...base, reference: `SP-AAAAA${n}-BBBBB${n}`, dedupeKey: `k${n}` });

    const before = new NotificationService(
      { repository, mailer: new UnconfiguredMailer(), logger },
      opts,
    );
    expect(await before.runOnce()).toBe(0);
    expect(repository.rows.map((r) => r.notificationStatus)).toEqual(['PENDING', 'PENDING']);

    const mailer = new FakeMailer();
    const after = new NotificationService({ repository, mailer, logger }, opts);
    expect(await after.runOnce()).toBe(2);
    expect(mailer.owner).toHaveLength(2);
  });

  it('never sends the same notification twice when attempts overlap (lease)', async () => {
    const { mailer, service, add } = setup();
    const msg = await add(1);
    const outcomes = await Promise.all([
      service.dispatch(msg.id),
      service.dispatch(msg.id),
      service.dispatch(msg.id),
    ]);
    expect(outcomes.filter((o) => o === 'sent')).toHaveLength(1);
    expect(mailer.owner).toHaveLength(1);
  });

  it('redacts credentials from stored error text', async () => {
    const { repository, mailer, service, add } = setup();
    const msg = await add(1);
    mailer.failOwnerWith = new Error(
      'auth failed password=hunter2 for smtp://user:topsecret@smtp.example.test',
    );
    await service.dispatch(msg.id);
    const stored = repository.rows[0]!.notificationLastError!;
    expect(stored).not.toMatch(/hunter2|topsecret/);
  });

  it('uses capped exponential back-off', () => {
    expect(backoffMs(1)).toBe(30_000);
    expect(backoffMs(2)).toBe(60_000);
    expect(backoffMs(3)).toBe(120_000);
    expect(backoffMs(30)).toBe(3_600_000);
  });
});
