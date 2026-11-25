import type { Request, RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import {
  MESSAGE_STATUSES,
  type MessageRepository,
  type StoredContactMessage,
} from '../repositories/types.js';

/** Admin view of a message. Internal ids and the de-duplication key are never exposed. */
export function toAdminView(m: StoredContactMessage) {
  return {
    reference: m.reference,
    name: m.name,
    email: m.email,
    organization: m.organization,
    subject: m.subject,
    inquiryType: m.inquiryType,
    message: m.message,
    status: m.status,
    notification: {
      status: m.notificationStatus,
      attempts: m.notificationAttempts,
      lastError: m.notificationLastError,
      lastAttemptAt: m.notificationLastAttemptAt,
      nextAttemptAt: m.notificationStatus === 'PENDING' ? m.notificationNextAttemptAt : null,
      deliveredToSmtpAt: m.notifiedAt,
    },
    acknowledgedAt: m.acknowledgedAt,
    createdAt: m.createdAt,
  };
}

const listQuery = z.object({
  status: z.enum(MESSAGE_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});
const patchBody = z.object({ status: z.enum(MESSAGE_STATUSES) }).strict();

const referenceParam = (req: Request): string => {
  const ref = String(req.params.reference ?? '');
  if (!/^SP-[0-9A-Z]{6}-[0-9A-Z]{6}$/.test(ref))
    throw new AppError(404, 'NOT_FOUND', 'Message not found.');
  return ref;
};

export function createAdminController(repository: MessageRepository, emailConfigured: boolean) {
  const list: RequestHandler = async (req, res) => {
    const q = listQuery.safeParse(req.query);
    if (!q.success) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters.');
    const { status, limit, page } = q.data;
    const { items, total } = await repository.list({ status, limit, offset: (page - 1) * limit });
    res.json({ success: true, total, page, limit, items: items.map(toAdminView) });
  };

  const get: RequestHandler = async (req, res) => {
    const message = await repository.findByReference(referenceParam(req));
    if (!message) throw new AppError(404, 'NOT_FOUND', 'Message not found.');
    res.json({ success: true, item: toAdminView(message) });
  };

  const patch: RequestHandler = async (req, res) => {
    const body = patchBody.safeParse(req.body);
    if (!body.success) throw new AppError(400, 'VALIDATION_ERROR', 'Provide a valid status.');
    const updated = await repository.updateStatus(referenceParam(req), body.data.status);
    if (!updated) throw new AppError(404, 'NOT_FOUND', 'Message not found.');
    res.json({ success: true, item: toAdminView(updated) });
  };

  const status: RequestHandler = async (_req, res) => {
    const notifications = await repository.countByNotificationStatus();
    res.json({ success: true, emailConfigured, notifications });
  };

  return { list, get, patch, status };
}
