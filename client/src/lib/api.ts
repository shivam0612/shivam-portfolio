import type { ContactFormValues } from './contactSchema';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(
  /\/+$/,
  '',
);
const TIMEOUT_MS = 15_000;

export type SubmitFailure =
  | { ok: false; kind: 'validation'; message: string; fieldErrors: Record<string, string> }
  | { ok: false; kind: 'rate_limited'; message: string; retryAfterSeconds?: number }
  | { ok: false; kind: 'too_large' | 'server' | 'network' | 'timeout'; message: string };

export type SubmitResult = { ok: true; reference: string } | SubmitFailure;

interface ApiBody {
  success?: boolean;
  reference?: string;
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;
}

/** Sends the contact form to the backend. Never throws: every outcome is a typed result. */
export async function submitContact(values: ContactFormValues): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const organization = values.organization.trim();
    const response = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        ...(organization ? { organization } : {}),
        subject: values.subject,
        inquiryType: values.inquiryType,
        message: values.message,
        consent: values.consent,
      }),
      signal: controller.signal,
    });

    let body: ApiBody = {};
    try {
      body = (await response.json()) as ApiBody;
    } catch {
      /* non-JSON body (e.g. a proxy error page) is handled by status below */
    }

    if (response.ok && body.success && typeof body.reference === 'string') {
      return { ok: true, reference: body.reference };
    }
    if (response.status === 400 && body.fieldErrors) {
      return {
        ok: false,
        kind: 'validation',
        message: body.message ?? 'Please correct the highlighted fields.',
        fieldErrors: body.fieldErrors,
      };
    }
    if (response.status === 429) {
      return {
        ok: false,
        kind: 'rate_limited',
        message: body.message ?? 'Too many messages in a short time. Please try again later.',
        retryAfterSeconds: body.retryAfterSeconds,
      };
    }
    if (response.status === 413) {
      return {
        ok: false,
        kind: 'too_large',
        message: 'Your message is too large to send. Please shorten it.',
      };
    }
    return { ok: false, kind: 'server', message: "We couldn't submit your message right now." };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    return aborted
      ? { ok: false, kind: 'timeout', message: 'The server took too long to respond.' }
      : { ok: false, kind: 'network', message: "We couldn't reach the server." };
  } finally {
    clearTimeout(timer);
  }
}
