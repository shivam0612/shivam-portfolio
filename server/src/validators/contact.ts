import { z } from 'zod';
import { cleanMultiLine, cleanSingleLine } from '../lib/text.js';

export const INQUIRY_TYPES = [
  'Professional Opportunity',
  'Supply Chain and Operations',
  'Technology and Projects',
  'Collaboration',
  'General Inquiry',
] as const;

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  organization: { max: 120 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

const required = (label: string) => ({
  error: (issue: { input?: unknown }) =>
    issue.input === undefined || issue.input === null
      ? `${label} is required.`
      : `${label} must be text.`,
});

/** Text field that is trimmed/sanitised first, then length-checked on the cleaned value. */
const line = (label: string, min: number, max: number) =>
  z
    .string(required(label))
    .transform(cleanSingleLine)
    .pipe(
      z
        .string()
        .min(1, `${label} is required.`)
        .min(min, `${label} must be at least ${min} characters.`)
        .max(max, `${label} must be at most ${max} characters.`),
    );

export const contactSchema = z
  .object({
    name: line('Name', LIMITS.name.min, LIMITS.name.max),
    email: z
      .string(required('Email'))
      .transform((v) => cleanSingleLine(v).toLowerCase())
      .pipe(
        z
          .string()
          .min(1, 'Email is required.')
          .max(LIMITS.email.max, 'Email is too long.')
          .pipe(z.email('Enter a valid email address.')),
      ),
    organization: z
      .string(required('Organization'))
      .transform(cleanSingleLine)
      .pipe(
        z
          .string()
          .max(
            LIMITS.organization.max,
            `Organization must be at most ${LIMITS.organization.max} characters.`,
          ),
      )
      .optional()
      .transform((v) => (v ? v : null)),
    subject: line('Subject', LIMITS.subject.min, LIMITS.subject.max),
    inquiryType: z.enum(INQUIRY_TYPES, { error: 'Choose one of the listed inquiry types.' }),
    message: z
      .string(required('Message'))
      .transform(cleanMultiLine)
      .pipe(
        z
          .string()
          .min(1, 'Message is required.')
          .min(LIMITS.message.min, `Message must be at least ${LIMITS.message.min} characters.`)
          .max(LIMITS.message.max, `Message must be at most ${LIMITS.message.max} characters.`),
      ),
    consent: z.literal(true, { error: 'You must agree to the privacy notice to send a message.' }),
  })
  // Reject unknown properties instead of silently ignoring them (mass-assignment protection).
  .strict();

export type ContactInput = z.output<typeof contactSchema>;

export interface ValidationFailure {
  fieldErrors: Record<string, string>;
}

/** Validate an untrusted request body. Returns the first message for each offending field. */
export function parseContact(
  body: unknown,
): { ok: true; data: ContactInput } | ({ ok: false } & ValidationFailure) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, fieldErrors: { _form: 'Request body must be a JSON object.' } };
  }
  const result = contactSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_form';
    if (issue.code === 'unrecognized_keys') {
      fieldErrors._form = `Unexpected field(s): ${issue.keys.join(', ')}.`;
    } else if (!(key in fieldErrors)) {
      fieldErrors[key] = issue.message;
    }
  }
  return { ok: false, fieldErrors };
}
