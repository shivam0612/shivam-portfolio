import express, { Router, type RequestHandler } from 'express';
import { createAdminController } from '../controllers/adminController.js';
import type { MessageRepository } from '../repositories/types.js';

export function createAdminRouter(opts: {
  repository: MessageRepository;
  emailConfigured: boolean;
  guard: RequestHandler;
  limiter: RequestHandler;
}) {
  const router = Router();
  const c = createAdminController(opts.repository, opts.emailConfigured);
  router.use(opts.limiter, opts.guard);
  router.get('/status', c.status);
  router.get('/messages', c.list);
  router.get('/messages/:reference', c.get);
  router.patch('/messages/:reference', express.json({ limit: '2kb' }), c.patch);
  return router;
}
