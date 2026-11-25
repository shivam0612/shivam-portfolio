import { randomUUID } from 'node:crypto';
import { ReferenceCollisionError } from '../lib/errors.js';
import type {
  MessageRepository,
  MessageStatus,
  NewContactMessage,
  NotificationCounts,
  NotificationResult,
  StoredContactMessage,
} from './types.js';

/** Test double with the same observable semantics as the Prisma repository. Not used in production. */
export class InMemoryMessageRepository implements MessageRepository {
  readonly rows: StoredContactMessage[] = [];
  /** When set, every call rejects with this error (simulates a database outage). */
  failWith: Error | null = null;

  constructor(private readonly clock: () => Date = () => new Date()) {}

  private guard() {
    if (this.failWith) throw this.failWith;
  }

  async create(data: NewContactMessage) {
    this.guard();
    const existing = this.rows.find((r) => r.dedupeKey === data.dedupeKey);
    if (existing) return { message: { ...existing }, created: false };
    if (this.rows.some((r) => r.reference === data.reference)) throw new ReferenceCollisionError();
    const now = this.clock();
    const row: StoredContactMessage = {
      id: randomUUID(),
      ...data,
      status: 'NEW',
      notificationStatus: 'PENDING',
      notificationAttempts: 0,
      notificationLastError: null,
      notificationLastAttemptAt: null,
      notificationNextAttemptAt: null,
      notifiedAt: null,
      acknowledgedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.push(row);
    return { message: { ...row }, created: true };
  }

  async findByReference(reference: string) {
    this.guard();
    const row = this.rows.find((r) => r.reference === reference);
    return row ? { ...row } : null;
  }

  async list({ status, limit, offset }: { status?: MessageStatus; limit: number; offset: number }) {
    this.guard();
    const filtered = this.rows
      .filter((r) => !status || r.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return {
      items: filtered.slice(offset, offset + limit).map((r) => ({ ...r })),
      total: filtered.length,
    };
  }

  async updateStatus(reference: string, status: MessageStatus) {
    this.guard();
    const row = this.rows.find((r) => r.reference === reference);
    if (!row) return null;
    row.status = status;
    row.updatedAt = this.clock();
    return { ...row };
  }

  private isDue(r: StoredContactMessage, now: Date) {
    return (
      r.notificationStatus === 'PENDING' &&
      (r.notificationNextAttemptAt === null || r.notificationNextAttemptAt <= now)
    );
  }

  async findDueNotificationIds(now: Date, limit: number) {
    this.guard();
    return this.rows
      .filter((r) => this.isDue(r, now))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit)
      .map((r) => r.id);
  }

  async claimNotification(id: string, now: Date, leaseUntil: Date) {
    this.guard();
    const row = this.rows.find((r) => r.id === id);
    if (!row || !this.isDue(row, now)) return null;
    row.notificationNextAttemptAt = leaseUntil;
    return { ...row };
  }

  async recordNotificationResult(id: string, result: NotificationResult) {
    this.guard();
    const row = this.rows.find((r) => r.id === id);
    if (!row) return;
    row.notificationAttempts += 1;
    row.notificationLastAttemptAt = result.at;
    if (result.sent) {
      row.notificationStatus = 'SENT';
      row.notifiedAt = result.at;
      row.notificationLastError = null;
      row.notificationNextAttemptAt = null;
    } else {
      row.notificationLastError = result.error;
      row.notificationNextAttemptAt = result.nextAttemptAt;
      row.notificationStatus = result.nextAttemptAt === null ? 'FAILED' : 'PENDING';
    }
  }

  async markAcknowledged(id: string, at: Date) {
    this.guard();
    const row = this.rows.find((r) => r.id === id);
    if (row) row.acknowledgedAt = at;
  }

  async countByNotificationStatus(): Promise<NotificationCounts> {
    this.guard();
    const counts: NotificationCounts = { PENDING: 0, SENT: 0, FAILED: 0 };
    for (const r of this.rows) counts[r.notificationStatus] += 1;
    return counts;
  }

  async ping() {
    this.guard();
  }
}
