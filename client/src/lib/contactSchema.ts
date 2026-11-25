import { z } from 'zod';

/** Must stay in sync with server/src/validators/contact.ts (the server is the authority). */
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

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your full name.')
    .min(LIMITS.name.min, `Name must be at least ${LIMITS.name.min} characters.`)
    .max(LIMITS.name.max, `Name must be at most ${LIMITS.name.max} characters.`),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .max(LIMITS.email.max, 'Email is too long.')
    .pipe(z.email('Enter a valid email address, like name@example.com.')),
  organization: z
    .string()
    .trim()
    .max(
      LIMITS.organization.max,
      `Organization must be at most ${LIMITS.organization.max} characters.`,
    ),
  subject: z
    .string()
    .trim()
    .min(1, 'Enter a subject.')
    .min(LIMITS.subject.min, `Subject must be at least ${LIMITS.subject.min} characters.`)
    .max(LIMITS.subject.max, `Subject must be at most ${LIMITS.subject.max} characters.`),
  inquiryType: z
    .string()
    .refine((v) => (INQUIRY_TYPES as readonly string[]).includes(v), 'Choose an inquiry type.'),
  message: z
    .string()
    .trim()
    .min(1, 'Write a message.')
    .min(LIMITS.message.min, `Message must be at least ${LIMITS.message.min} characters.`)
    .max(LIMITS.message.max, `Message must be at most ${LIMITS.message.max} characters.`),
  consent: z
    .boolean()
    .refine((v) => v === true, 'You must agree to the privacy notice to send a message.'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
