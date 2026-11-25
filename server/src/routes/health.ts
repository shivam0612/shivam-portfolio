import { Router } from 'express';
import type { MessageRepository } from '../repositories/types.js';

export function createHealthRouter(repository: MessageRepository) {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });
  // Readiness: proves the database is reachable and migrated. Reveals nothing else.
  router.get('/ready', async (_req, res) => {
    try {
      await repository.ping();
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });
  return router;
}
