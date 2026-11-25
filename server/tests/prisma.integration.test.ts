import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { pino } from 'pino';
import { createApp } from '../src/app.js';
import { createPrismaClient, type PrismaClient } from '../src/db/prisma.js';
import { ReferenceCollisionError, RepositoryUnavailableError } from '../src/lib/errors.js';
import { PrismaMessageRepository } from '../src/repositories/prismaMessageRepository.js';
import { NotificationService } from '../src/services/notificationService.js';
import { FakeMailer, makeConfig, validPayload } from './helpers.js';

/**
 * Runs against a REAL PostgreSQL database with the migration applied.
 * Skipped unless TEST_DATABASE_URL is set (see docs/SETUP.md). WARNING: the table is truncated.
 */
const url = process.env.TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

suite('PrismaMessageRepository (real PostgreSQL)', () => {
  let prisma: PrismaClient;
  let repo: PrismaMessageRepository;

  const sample = (n: number) => ({
    reference: `SP-TEST0${n}-ABCDE${n}`,
    name: 'Casey Lee',
    email: 'casey@example.com',
    organization: null,
    subject: 'Integration test subject',
    inquiryType: 'Collaboration',
    message: 'Integration test message body.',
    consent: true as const,
    dedupeKey: `dedupe-${n}`,
  });

  beforeAll(() => {
    prisma = createPrismaClient(url!);
    repo = new PrismaMessageRepository(prisma);
  });
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE contact_messages');
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('persists a message and reads it back by public reference', async () => {
    const { message, created } = await repo.create(sample(1));
    expect(created).toBe(true);
    expect(message).toMatchObject({
      reference: 'SP-TEST01-ABCDE1',
      status: 'NEW',
      notificationStatus: 'PENDING',
      notificationAttempts: 0,
    });

    const found = await repo.findByReference('SP-TEST01-ABCDE1');
    expect(found?.email).toBe('casey@example.com');
    expect(await repo.findByReference('SP-NOPE00-NOPE00')).toBeNull();
    // Row really exists in the table (not just in client memory).
    const raw = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      'SELECT count(*) FROM contact_messages',
    );
    expect(Number(raw[0]!.count)).toBe(1);
  });

  it('returns the existing row for a duplicate dedupe key and throws on reference collisions', async () => {
    const first = await repo.create(sample(1));
    const dup = await repo.create({ ...sample(1), reference: 'SP-TEST09-ZZZZZ9' });
    expect(dup.created).toBe(false);
    expect(dup.message.reference).toBe(first.message.reference);

    await expect(
      repo.create({ ...sample(2), reference: first.message.reference }),
    ).rejects.toBeInstanceOf(ReferenceCollisionError);
  });

  it('enforces column length limits at the database level', async () => {
    await expect(repo.create({ ...sample(3), message: 'x'.repeat(5001) })).rejects.toThrow();
  });

  it('grants a notification lease to exactly one concurrent claimant', async () => {
    const { message } = await repo.create(sample(1));
    const now = new Date();
    const lease = new Date(now.getTime() + 60_000);
    const results = await Promise.all(
      Array.from({ length: 5 }, () => repo.claimNotification(message.id, now, lease)),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    // While leased it is not due.
    expect(await repo.findDueNotificationIds(now, 10)).toEqual([]);
    expect(await repo.findDueNotificationIds(new Date(lease.getTime() + 1), 10)).toEqual([
      message.id,
    ]);
  });

  it('records notification success, retry and permanent failure', async () => {
    const a = (await repo.create(sample(1))).message;
    const b = (await repo.create(sample(2))).message;
    const c = (await repo.create(sample(3))).message;
    const at = new Date();
    await repo.recordNotificationResult(a.id, { sent: true, at });
    await repo.recordNotificationResult(b.id, {
      sent: false,
      at,
      error: 'ETIMEDOUT',
      nextAttemptAt: new Date(at.getTime() + 30_000),
    });
    await repo.recordNotificationResult(c.id, {
      sent: false,
      at,
      error: 'rejected',
      nextAttemptAt: null,
    });

    expect(await repo.findByReference(a.reference)).toMatchObject({
      notificationStatus: 'SENT',
      notificationAttempts: 1,
    });
    expect(await repo.findByReference(b.reference)).toMatchObject({
      notificationStatus: 'PENDING',
      notificationLastError: 'ETIMEDOUT',
    });
    expect(await repo.findByReference(c.reference)).toMatchObject({ notificationStatus: 'FAILED' });
    expect(await repo.countByNotificationStatus()).toEqual({ PENDING: 1, SENT: 1, FAILED: 1 });
  });

  it('lists with filters and pagination, and updates status', async () => {
    for (const n of [1, 2, 3]) await repo.create(sample(n));
    await repo.updateStatus('SP-TEST02-ABCDE2', 'ARCHIVED');
    const page = await repo.list({ limit: 2, offset: 0 });
    expect(page.total).toBe(3);
    expect(page.items).toHaveLength(2);
    expect((await repo.list({ status: 'ARCHIVED', limit: 10, offset: 0 })).total).toBe(1);
    expect(await repo.updateStatus('SP-NONE00-NONE00', 'READ')).toBeNull();
  });

  it('pings successfully when migrated, and reports unavailability when the database is unreachable', async () => {
    await expect(repo.ping()).resolves.toBeUndefined();
    const dead = new PrismaMessageRepository(
      createPrismaClient('postgresql://x:x@127.0.0.1:1/none'),
    );
    await expect(dead.ping()).rejects.toBeInstanceOf(RepositoryUnavailableError);
  });

  it('end to end: HTTP POST /api/contact stores a row in PostgreSQL and attempts notification', async () => {
    const config = makeConfig();
    const logger = pino({ level: 'silent' });
    const mailer = new FakeMailer();
    const notifications = new NotificationService(
      { repository: repo, mailer, logger },
      { ...config.notifications, acknowledgeVisitors: false },
    );
    const app = createApp({ config, logger, repository: repo, notifications });

    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(validPayload));
    expect(res.status).toBe(201);

    const row = await repo.findByReference(res.body.reference);
    expect(row).toMatchObject({
      name: 'Jordan Rivera',
      email: 'jordan@example.com',
      notificationStatus: 'SENT',
    });
    expect(mailer.owner).toHaveLength(1);

    const again = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(validPayload));
    expect(again.status).toBe(200);
    expect(again.body.reference).toBe(res.body.reference);
    expect((await repo.list({ limit: 10, offset: 0 })).total).toBe(1);
  });

  it('end to end: a stored message survives a failing mail server', async () => {
    const config = makeConfig();
    const logger = pino({ level: 'silent' });
    const mailer = new FakeMailer();
    mailer.failOwnerWith = new Error('connect ECONNREFUSED');
    const notifications = new NotificationService(
      { repository: repo, mailer, logger },
      { ...config.notifications, acknowledgeVisitors: false },
    );
    const app = createApp({ config, logger, repository: repo, notifications });

    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(validPayload));
    expect(res.status).toBe(201);
    const row = await repo.findByReference(res.body.reference);
    expect(row).toMatchObject({ notificationStatus: 'PENDING', notificationAttempts: 1 });
    expect(row?.notificationLastError).toContain('ECONNREFUSED');
  });
});
