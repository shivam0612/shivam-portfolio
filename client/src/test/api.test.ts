import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitContact } from '../lib/api';
import type { ContactFormValues } from '../lib/contactSchema';

const values: ContactFormValues = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  organization: '',
  subject: 'Hello there',
  inquiryType: 'General Inquiry',
  message: 'A perfectly fine message.',
  consent: true,
};
const respond = (status: number, body: unknown, raw = false) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (raw) throw new Error('bad json');
        return body;
      },
    }),
  );

afterEach(() => vi.unstubAllGlobals());

describe('submitContact', () => {
  it('POSTs JSON to /api/contact and omits an empty organization', async () => {
    respond(201, { success: true, reference: 'SP-1', message: 'ok' });
    const result = await submitContact(values);
    expect(result).toEqual({ ok: true, reference: 'SP-1' });
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init!.body as string)).toEqual({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      subject: 'Hello there',
      inquiryType: 'General Inquiry',
      message: 'A perfectly fine message.',
      consent: true,
    });
  });

  it('includes organization when provided', async () => {
    respond(201, { success: true, reference: 'SP-2' });
    await submitContact({ ...values, organization: ' Acme ' });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string).organization).toBe(
      'Acme',
    );
  });

  it('maps 400 to field errors', async () => {
    respond(400, { success: false, message: 'Please correct', fieldErrors: { email: 'bad' } });
    expect(await submitContact(values)).toMatchObject({
      ok: false,
      kind: 'validation',
      fieldErrors: { email: 'bad' },
    });
  });

  it('maps 429 with retry information', async () => {
    respond(429, { success: false, message: 'Slow down', retryAfterSeconds: 120 });
    expect(await submitContact(values)).toMatchObject({
      ok: false,
      kind: 'rate_limited',
      retryAfterSeconds: 120,
    });
  });

  it('maps 413 and 500 to friendly failures', async () => {
    respond(413, {});
    expect(await submitContact(values)).toMatchObject({ ok: false, kind: 'too_large' });
    respond(500, { success: false });
    expect(await submitContact(values)).toMatchObject({ ok: false, kind: 'server' });
  });

  it('does not treat a non-JSON error page (e.g. proxy 502) as success', async () => {
    respond(502, null, true);
    expect(await submitContact(values)).toMatchObject({ ok: false, kind: 'server' });
  });

  it('does not treat a 200 without a reference as success', async () => {
    respond(200, { success: true });
    expect(await submitContact(values)).toMatchObject({ ok: false });
  });

  it('reports network failure and timeouts without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await submitContact(values)).toMatchObject({ ok: false, kind: 'network' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError')));
    expect(await submitContact(values)).toMatchObject({ ok: false, kind: 'timeout' });
  });
});
