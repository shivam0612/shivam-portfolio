import type { RequestHandler } from 'express';
import { AppError } from '../lib/errors.js';
import type { ContactService } from '../services/contactService.js';
import { parseContact } from '../validators/contact.js';

export function createContactController(service: ContactService): RequestHandler {
  return async (req, res) => {
    if (!req.is('application/json')) {
      throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send the request as application/json.');
    }
    const parsed = parseContact(req.body);
    if (!parsed.ok) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Please correct the highlighted fields.',
        parsed.fieldErrors,
      );
    }
    const { reference, duplicate } = await service.submit(parsed.data);
    // The response never reveals notification state or internal ids.
    res.status(duplicate ? 200 : 201).json({
      success: true,
      message: 'Your message has been received.',
      reference,
    });
  };
}
