import express, { Router, type RequestHandler } from 'express';
import type { ContactService } from '../services/contactService.js';
import { createContactController } from '../controllers/contactController.js';

export const CONTACT_BODY_LIMIT = '16kb';

export function createContactRouter(service: ContactService, limiter: RequestHandler) {
  const router = Router();
  // Order matters: throttle first so floods are rejected before any body parsing or database work.
  router.post(
    '/',
    limiter,
    express.json({ limit: CONTACT_BODY_LIMIT }),
    createContactController(service),
  );
  return router;
}
