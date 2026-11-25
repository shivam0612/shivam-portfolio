import type { Logger } from '../config/logger.js';
import { redactSecrets } from '../lib/text.js';
import type { MessageRepository } from '../repositories/types.js';
import type { Mailer } from './mailer.js';

export type DispatchOutcome = 'sent' | 'retry' | 'failed' | 'skipped' | 'busy';

export interface NotificationOptions {
  maxAttempts: number;
  leaseMs: number;
  retryIntervalMs: number;
  acknowledgeVisitors: boolean;
  now?: () => Date;
}

/** Exponential back-off: 30s, 1m, 2m, 4m ... capped at one hour. */
export function backoffMs(attempts: number): number {
  return Math.min(30_000 * 2 ** Math.max(0, attempts - 1), 3_600_000);
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return redactSecrets(`${code ? `${String(code)}: ` : ''}${error.message}`).slice(0, 300);
  }
  return 'Unknown error';
}

/**
 * Outbox-style notification delivery. The message is already stored before this runs; a failure here
 * is recorded on the row (status, attempts, last error, next attempt) and retried by the worker.
 */
export class NotificationService {
  private readonly now: () => Date;
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly deps: { repository: MessageRepository; mailer: Mailer; logger: Logger },
    private readonly options: NotificationOptions,
  ) {
    this.now = options.now ?? (() => new Date());
  }

  /** Attempt delivery for one stored message. Never throws. */
  async dispatch(messageId: string): Promise<DispatchOutcome> {
    const { repository, mailer, logger } = this.deps;
    if (!mailer.configured) return 'skipped';

    try {
      const now = this.now();
      const claimed = await repository.claimNotification(
        messageId,
        now,
        new Date(now.getTime() + this.options.leaseMs),
      );
      if (!claimed) return 'busy';

      try {
        await mailer.sendOwnerNotification(claimed);
      } catch (error) {
        const attempts = claimed.notificationAttempts + 1;
        const exhausted = attempts >= this.options.maxAttempts;
        const at = this.now();
        await repository.recordNotificationResult(claimed.id, {
          sent: false,
          at,
          error: describeError(error),
          nextAttemptAt: exhausted ? null : new Date(at.getTime() + backoffMs(attempts)),
        });
        logger.warn(
          { reference: claimed.reference, attempts, exhausted, err: describeError(error) },
          exhausted ? 'notification permanently failed' : 'notification failed; will retry',
        );
        return exhausted ? 'failed' : 'retry';
      }

      await repository.recordNotificationResult(claimed.id, { sent: true, at: this.now() });
      logger.info({ reference: claimed.reference }, 'owner notification accepted by SMTP server');

      if (this.options.acknowledgeVisitors && !claimed.acknowledgedAt) {
        try {
          await mailer.sendVisitorAcknowledgement(claimed);
          await repository.markAcknowledged(claimed.id, this.now());
        } catch (error) {
          logger.warn(
            { reference: claimed.reference, err: describeError(error) },
            'visitor acknowledgment failed',
          );
        }
      }
      return 'sent';
    } catch (error) {
      logger.error({ err: describeError(error) }, 'notification dispatch error');
      return 'retry';
    }
  }

  /** Deliver every notification that is due (new backlog or scheduled retries). */
  async runOnce(limit = 20): Promise<number> {
    if (!this.deps.mailer.configured || this.running) return 0;
    this.running = true;
    try {
      const ids = await this.deps.repository.findDueNotificationIds(this.now(), limit);
      let processed = 0;
      for (const id of ids) {
        const outcome = await this.dispatch(id);
        if (outcome !== 'busy' && outcome !== 'skipped') processed += 1;
      }
      return processed;
    } catch (error) {
      this.deps.logger.error({ err: describeError(error) }, 'notification worker run failed');
      return 0;
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (this.timer) return;
    if (!this.deps.mailer.configured) {
      this.deps.logger.warn(
        'SMTP is not configured: notifications stay PENDING until it is configured.',
      );
      return;
    }
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.options.retryIntervalMs);
    this.timer.unref();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
