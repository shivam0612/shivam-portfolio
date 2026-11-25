import { ReferenceCollisionError, RepositoryUnavailableError } from '../lib/errors.js';
import type { PrismaClient } from '../db/prisma.js';
import type {
  MessageRepository,
  MessageStatus,
  NewContactMessage,
  NotificationCounts,
  NotificationResult,
  StoredContactMessage,
} from './types.js';

// Prisma codes meaning "cannot reach the database" or "schema not migrated".
const UNAVAILABLE_CODES = new Set([
  'P1000',
  'P1001',
  'P1002',
  'P1003',
  'P1008',
  'P1017',
  'P2021',
  'P2022',
  'P2024',
]);

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

function isUnavailable(error: unknown): boolean {
  const code = errorCode(error);
  if (
    code &&
    (UNAVAILABLE_CODES.has(code) ||
      ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(code))
  ) {
    return true;
  }
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : '';
  return (
    name === 'PrismaClientInitializationError' ||
    /ECONNREFUSED|ENOTFOUND|connection terminated|Can't reach database/i.test(message)
  );
}

/** PostgreSQL repository. All access goes through Prisma's parameterised queries. */
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ReferenceCollisionError) throw error;
      if (isUnavailable(error)) throw new RepositoryUnavailableError(undefined, { cause: error });
      throw error;
    }
  }

  create(data: NewContactMessage) {
    return this.run(async () => {
      try {
        const message = await this.prisma.contactMessage.create({ data });
        return { message: message as StoredContactMessage, created: true };
      } catch (error) {
        if (errorCode(error) !== 'P2002') throw error;
        // Unique violation: either an identical recent message (dedupeKey) or a reference collision.
        const existing = await this.prisma.contactMessage.findUnique({
          where: { dedupeKey: data.dedupeKey },
        });
        if (existing) return { message: existing as StoredContactMessage, created: false };
        throw new ReferenceCollisionError();
      }
    });
  }

  findByReference(reference: string) {
    return this.run(
      async () =>
        (await this.prisma.contactMessage.findUnique({
          where: { reference },
        })) as StoredContactMessage | null,
    );
  }

  list({ status, limit, offset }: { status?: MessageStatus; limit: number; offset: number }) {
    return this.run(async () => {
      const where = status ? { status } : {};
      const [items, total] = await this.prisma.$transaction([
        this.prisma.contactMessage.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.contactMessage.count({ where }),
      ]);
      return { items: items as StoredContactMessage[], total };
    });
  }

  updateStatus(reference: string, status: MessageStatus) {
    return this.run(async () => {
      const { count } = await this.prisma.contactMessage.updateMany({
        where: { reference },
        data: { status },
      });
      if (count === 0) return null;
      return (await this.prisma.contactMessage.findUnique({
        where: { reference },
      })) as StoredContactMessage | null;
    });
  }

  findDueNotificationIds(now: Date, limit: number) {
    return this.run(async () => {
      const rows = await this.prisma.contactMessage.findMany({
        where: {
          notificationStatus: 'PENDING',
          OR: [{ notificationNextAttemptAt: null }, { notificationNextAttemptAt: { lte: now } }],
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        select: { id: true },
      });
      return rows.map((r: { id: string }) => r.id);
    });
  }

  claimNotification(id: string, now: Date, leaseUntil: Date) {
    return this.run(async () => {
      // Single atomic UPDATE ... WHERE: only one caller can win the lease.
      const { count } = await this.prisma.contactMessage.updateMany({
        where: {
          id,
          notificationStatus: 'PENDING',
          OR: [{ notificationNextAttemptAt: null }, { notificationNextAttemptAt: { lte: now } }],
        },
        data: { notificationNextAttemptAt: leaseUntil },
      });
      if (count !== 1) return null;
      return (await this.prisma.contactMessage.findUnique({
        where: { id },
      })) as StoredContactMessage | null;
    });
  }

  recordNotificationResult(id: string, result: NotificationResult) {
    return this.run(async () => {
      const common = {
        notificationAttempts: { increment: 1 },
        notificationLastAttemptAt: result.at,
      };
      await this.prisma.contactMessage.update({
        where: { id },
        data: result.sent
          ? {
              ...common,
              notificationStatus: 'SENT',
              notifiedAt: result.at,
              notificationLastError: null,
              notificationNextAttemptAt: null,
            }
          : {
              ...common,
              notificationStatus: result.nextAttemptAt === null ? 'FAILED' : 'PENDING',
              notificationLastError: result.error.slice(0, 500),
              notificationNextAttemptAt: result.nextAttemptAt,
            },
      });
    });
  }

  markAcknowledged(id: string, at: Date) {
    return this.run(async () => {
      await this.prisma.contactMessage.update({ where: { id }, data: { acknowledgedAt: at } });
    });
  }

  countByNotificationStatus() {
    return this.run(async (): Promise<NotificationCounts> => {
      const groups = await this.prisma.contactMessage.groupBy({
        by: ['notificationStatus'],
        _count: { _all: true },
      });
      const counts: NotificationCounts = { PENDING: 0, SENT: 0, FAILED: 0 };
      for (const g of groups) counts[g.notificationStatus] = g._count._all;
      return counts;
    });
  }

  ping() {
    // Reading the table (not just SELECT 1) also proves the migration has been applied.
    return this.run(async () => {
      await this.prisma.contactMessage.findFirst({ select: { id: true } });
    });
  }
}
