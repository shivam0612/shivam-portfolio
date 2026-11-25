import type { Logger } from '../config/logger.js';
import { ReferenceCollisionError } from '../lib/errors.js';
import { generateReference } from '../lib/reference.js';
import { sha256Hex } from '../lib/text.js';
import type { MessageRepository } from '../repositories/types.js';
import type { ContactInput } from '../validators/contact.js';
import type { NotificationService } from './notificationService.js';

/** Identical messages inside one bucket are treated as the same submission (double-click, retry). */
export const DEDUPE_WINDOW_MS = 10 * 60_000;

export function buildDedupeKey(input: ContactInput, now: Date): string {
  const bucket = Math.floor(now.getTime() / DEDUPE_WINDOW_MS);
  return sha256Hex([input.email, input.subject.toLowerCase(), input.message, bucket].join('\n'));
}

export interface SubmitResult {
  reference: string;
  duplicate: boolean;
}

export class ContactService {
  private readonly now: () => Date;

  constructor(
    private readonly deps: {
      repository: MessageRepository;
      notifications: NotificationService;
      logger: Logger;
      now?: () => Date;
    },
  ) {
    this.now = deps.now ?? (() => new Date());
  }

  /** Persist first, then attempt notification. A notification problem never fails the submission. */
  async submit(input: ContactInput): Promise<SubmitResult> {
    const { repository, notifications, logger } = this.deps;
    const dedupeKey = buildDedupeKey(input, this.now());

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const reference = generateReference();
      try {
        const { message, created } = await repository.create({
          reference,
          name: input.name,
          email: input.email,
          organization: input.organization,
          subject: input.subject,
          inquiryType: input.inquiryType,
          message: input.message,
          consent: true,
          dedupeKey,
        });
        if (!created) {
          logger.info({ reference: message.reference }, 'duplicate contact submission ignored');
          return { reference: message.reference, duplicate: true };
        }
        logger.info(
          { reference: message.reference, inquiryType: message.inquiryType },
          'contact message stored',
        );
        await notifications.dispatch(message.id); // never throws
        return { reference: message.reference, duplicate: false };
      } catch (error) {
        if (error instanceof ReferenceCollisionError) continue;
        throw error;
      }
    }
    throw new Error('Unable to allocate a unique reference');
  }
}
