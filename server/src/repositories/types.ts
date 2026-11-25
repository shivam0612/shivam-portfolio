export const MESSAGE_STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED', 'SPAM'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface StoredContactMessage {
  id: string;
  reference: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  inquiryType: string;
  message: string;
  consent: boolean;
  status: MessageStatus;
  dedupeKey: string;
  notificationStatus: NotificationStatus;
  notificationAttempts: number;
  notificationLastError: string | null;
  notificationLastAttemptAt: Date | null;
  notificationNextAttemptAt: Date | null;
  notifiedAt: Date | null;
  acknowledgedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewContactMessage {
  reference: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  inquiryType: string;
  message: string;
  consent: true;
  dedupeKey: string;
}

export type NotificationResult =
  { sent: true; at: Date } | { sent: false; at: Date; error: string; nextAttemptAt: Date | null };

export interface NotificationCounts {
  PENDING: number;
  SENT: number;
  FAILED: number;
}

/**
 * Persistence boundary for contact messages. The production implementation uses Prisma/PostgreSQL;
 * the in-memory implementation exists only so unit tests can run without a database.
 */
export interface MessageRepository {
  /** Insert, or return the existing row when an identical message was already received recently. */
  create(data: NewContactMessage): Promise<{ message: StoredContactMessage; created: boolean }>;
  findByReference(reference: string): Promise<StoredContactMessage | null>;
  list(options: { status?: MessageStatus; limit: number; offset: number }): Promise<{
    items: StoredContactMessage[];
    total: number;
  }>;
  updateStatus(reference: string, status: MessageStatus): Promise<StoredContactMessage | null>;
  /** IDs of messages whose notification is pending and due. */
  findDueNotificationIds(now: Date, limit: number): Promise<string[]>;
  /**
   * Atomically take a short lease on a pending, due notification so that concurrent workers or
   * server instances never send the same notification twice. Returns null if not claimable.
   */
  claimNotification(id: string, now: Date, leaseUntil: Date): Promise<StoredContactMessage | null>;
  recordNotificationResult(id: string, result: NotificationResult): Promise<void>;
  markAcknowledged(id: string, at: Date): Promise<void>;
  countByNotificationStatus(): Promise<NotificationCounts>;
  /** Throws RepositoryUnavailableError when the database is unreachable or not migrated. */
  ping(): Promise<void>;
}
