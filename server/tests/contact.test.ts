import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { RepositoryUnavailableError } from '../src/lib/errors.js';
import { REFERENCE_PATTERN } from '../src/lib/reference.js';
import { FakeMailer, UnconfiguredMailer, buildTestApp, validPayload } from './helpers.js';

const post = (app: Parameters<typeof request>[0], body: unknown) =>
  request(app)
    .post('/api/contact')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(body));

describe('POST /api/contact — acceptance and persistence', () => {
  it('accepts a valid message, returns 201 with a public reference, and persists it', async () => {
    const { app, repository } = buildTestApp();
    const res = await post(app, validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: 'Your message has been received.',
      reference: expect.stringMatching(REFERENCE_PATTERN),
    });
    expect(repository.rows).toHaveLength(1);
    expect(repository.rows[0]).toMatchObject({
      reference: res.body.reference,
      name: 'Jordan Rivera',
      email: 'jordan@example.com',
      status: 'NEW',
      consent: true,
    });
    // Internal identifiers are not leaked to the public response.
    expect(JSON.stringify(res.body)).not.toContain(repository.rows[0]!.id);
  });

  it('trims whitespace and normalises e-mail case; organization is optional', async () => {
    const { app, repository } = buildTestApp();
    const { organization: _omit, ...withoutOrg } = validPayload;
    const res = await post(app, {
      ...withoutOrg,
      name: '  Jordan   Rivera  ',
      email: '  Jordan@Example.COM ',
      message: '   A perfectly fine message body.   ',
    });
    expect(res.status).toBe(201);
    expect(repository.rows[0]).toMatchObject({
      name: 'Jordan Rivera',
      email: 'jordan@example.com',
      organization: null,
      message: 'A perfectly fine message body.',
    });
  });

  it('strips control characters and line breaks from single-line fields (header-injection safe)', async () => {
    const mailer = new FakeMailer();
    const { app, repository } = buildTestApp({ mailer });
    const res = await post(app, {
      ...validPayload,
      subject: 'Hello\r\nBcc: attacker@example.com\u0000',
    });
    expect(res.status).toBe(201);
    // eslint-disable-next-line no-control-regex -- deliberately asserting control characters are stripped
    expect(repository.rows[0]!.subject).not.toMatch(/[\r\n\u0000]/);
  });

  it('handles identical repeat submissions idempotently (one row, one notification)', async () => {
    const mailer = new FakeMailer();
    const { app, repository } = buildTestApp({ mailer });
    const first = await post(app, validPayload);
    const second = await post(app, validPayload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.reference).toBe(first.body.reference);
    expect(repository.rows).toHaveLength(1);
    expect(mailer.owner).toHaveLength(1);

    const different = await post(app, {
      ...validPayload,
      message: 'A different message entirely, please.',
    });
    expect(different.status).toBe(201);
    expect(different.body.reference).not.toBe(first.body.reference);
    expect(repository.rows).toHaveLength(2);
  });
});

describe('POST /api/contact — validation', () => {
  it('rejects missing required fields with per-field errors (400)', async () => {
    const { app, repository } = buildTestApp();
    const res = await post(app, {});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(res.body.fieldErrors).sort()).toEqual(
      ['consent', 'email', 'inquiryType', 'message', 'name', 'subject'].sort(),
    );
    expect(repository.rows).toHaveLength(0);
  });

  it.each([
    ['plain text', 'not-an-email'],
    ['missing domain', 'user@'],
    ['spaces inside', 'us er@example.com'],
    ['too long', `${'a'.repeat(250)}@example.com`],
  ])('rejects an invalid e-mail address (%s)', async (_label, email) => {
    const { app } = buildTestApp();
    const res = await post(app, { ...validPayload, email });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors.email).toBeTruthy();
  });

  it('rejects an unknown inquiry type', async () => {
    const { app } = buildTestApp();
    const res = await post(app, { ...validPayload, inquiryType: 'Sell Me Something' });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors.inquiryType).toBeTruthy();
  });

  it('rejects empty and whitespace-only messages', async () => {
    const { app } = buildTestApp();
    for (const message of ['', '     \n\t   ']) {
      const res = await post(app, { ...validPayload, message });
      expect(res.status).toBe(400);
      expect(res.body.fieldErrors.message).toBeTruthy();
    }
  });

  it('rejects a message longer than 5000 characters (400) and accepts exactly 5000', async () => {
    const { app } = buildTestApp();
    const tooLong = await post(app, { ...validPayload, message: 'x'.repeat(5001) });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.fieldErrors.message).toMatch(/5000/);

    const boundary = await post(app, { ...validPayload, message: 'x'.repeat(5000) });
    expect(boundary.status).toBe(201);
  });

  it('enforces maximum lengths on other text fields', async () => {
    const { app } = buildTestApp();
    const res = await post(app, {
      ...validPayload,
      name: 'n'.repeat(101),
      subject: 's'.repeat(151),
      organization: 'o'.repeat(121),
    });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fieldErrors).sort()).toEqual(['name', 'organization', 'subject']);
  });

  it('requires consent to be exactly true', async () => {
    const { app } = buildTestApp();
    for (const consent of [false, 'true', 1, undefined]) {
      const res = await post(app, { ...validPayload, consent });
      expect(res.status).toBe(400);
      expect(res.body.fieldErrors.consent).toBeTruthy();
    }
  });

  it('rejects unknown properties so clients cannot set internal columns (mass assignment)', async () => {
    const { app, repository } = buildTestApp();
    const res = await post(app, {
      ...validPayload,
      status: 'REPLIED',
      id: 'x',
      notificationStatus: 'SENT',
    });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors._form).toMatch(/Unexpected field/);
    expect(repository.rows).toHaveLength(0);
  });

  it('rejects bodies that are not JSON objects', async () => {
    const { app } = buildTestApp();
    expect((await post(app, ['a', 'b'])).status).toBe(400);
    expect((await post(app, 'a string')).status).toBe(400);
    const broken = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":');
    expect(broken.status).toBe(400);
    expect(broken.body.code).toBe('INVALID_JSON');
  });

  it('rejects non-JSON content types (415)', async () => {
    const { app } = buildTestApp();
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(res.status).toBe(415);
  });

  it('returns 413 for excessively large request bodies', async () => {
    const { app, repository } = buildTestApp();
    const res = await post(app, { ...validPayload, message: 'x'.repeat(40_000) });
    expect(res.status).toBe(413);
    expect(res.body.code).toBe('PAYLOAD_TOO_LARGE');
    expect(repository.rows).toHaveLength(0);
  });
});

describe('POST /api/contact — rate limiting', () => {
  it('returns 429 once the per-IP limit is exceeded', async () => {
    const { app, repository } = buildTestApp({ env: { CONTACT_RATE_LIMIT_MAX: '3' } });
    const statuses: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const res = await post(app, {
        ...validPayload,
        message: `Distinct message number ${i} for the limiter.`,
      });
      statuses.push(res.status);
      if (res.status === 429) {
        expect(res.body.code).toBe('RATE_LIMITED');
        expect(res.headers['retry-after']).toBeDefined();
      }
    }
    expect(statuses).toEqual([201, 201, 201, 429, 429]);
    expect(repository.rows).toHaveLength(3);
  });
});

describe('POST /api/contact — email notification behaviour', () => {
  it('keeps the stored message and returns 201 when the SMTP send fails', async () => {
    const mailer = new FakeMailer();
    mailer.failOwnerWith = Object.assign(new Error('connect ETIMEDOUT smtp.example.test:587'), {
      code: 'ETIMEDOUT',
    });
    const { app, repository, clock } = buildTestApp({ mailer });

    const res = await post(app, validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const row = repository.rows[0]!;
    expect(row.notificationStatus).toBe('PENDING'); // retry scheduled, not lost
    expect(row.notificationAttempts).toBe(1);
    expect(row.notificationLastError).toContain('ETIMEDOUT');
    expect(row.notificationNextAttemptAt!.getTime()).toBeGreaterThan(clock.now().getTime());
    // The public response does not claim that e-mail was delivered or expose notification state.
    expect(JSON.stringify(res.body)).not.toMatch(/notif|email|sent/i);
  });

  it('stores the message and leaves the notification pending when SMTP is not configured', async () => {
    const { app, repository } = buildTestApp({ mailer: new UnconfiguredMailer() });
    const res = await post(app, validPayload);
    expect(res.status).toBe(201);
    expect(repository.rows[0]).toMatchObject({
      notificationStatus: 'PENDING',
      notificationAttempts: 0,
    });
  });

  it('marks the notification as SENT and records the time on success', async () => {
    const mailer = new FakeMailer();
    const { app, repository } = buildTestApp({ mailer });
    await post(app, validPayload);
    expect(mailer.owner).toHaveLength(1);
    expect(repository.rows[0]).toMatchObject({
      notificationStatus: 'SENT',
      notificationAttempts: 1,
    });
    expect(repository.rows[0]!.notifiedAt).toBeInstanceOf(Date);
  });

  it('sends the optional visitor acknowledgment only when enabled, and its failure is non-fatal', async () => {
    const off = new FakeMailer();
    await post(buildTestApp({ mailer: off }).app, validPayload);
    expect(off.acknowledgements).toHaveLength(0);

    const on = new FakeMailer();
    const ctx = buildTestApp({ mailer: on, env: { CONTACT_SEND_ACKNOWLEDGEMENT: 'true' } });
    await post(ctx.app, validPayload);
    expect(on.acknowledgements).toHaveLength(1);
    expect(ctx.repository.rows[0]!.acknowledgedAt).toBeInstanceOf(Date);

    const flaky = new FakeMailer();
    flaky.failAckWith = new Error('mailbox full');
    const ctx2 = buildTestApp({ mailer: flaky, env: { CONTACT_SEND_ACKNOWLEDGEMENT: 'true' } });
    const res = await post(ctx2.app, validPayload);
    expect(res.status).toBe(201);
    expect(ctx2.repository.rows[0]).toMatchObject({
      notificationStatus: 'SENT',
      acknowledgedAt: null,
    });
  });
});

describe('POST /api/contact — error handling and information disclosure', () => {
  it('returns a generic 500 without leaking internals', async () => {
    const { app, repository } = buildTestApp();
    repository.failWith = new Error(
      'connect failed postgresql://admin:SuperSecret123@db.internal:5432/prod',
    );
    const res = await post(app, validPayload);
    expect(res.status).toBe(500);
    const body = JSON.stringify(res.body);
    expect(res.body).toMatchObject({ success: false, code: 'INTERNAL_ERROR' });
    expect(body).not.toMatch(/SuperSecret|postgres|db\.internal|stack|at .*\.ts/i);
  });

  it('returns 503 with a safe message when the database is unavailable', async () => {
    const { app, repository } = buildTestApp();
    repository.failWith = new RepositoryUnavailableError();
    const res = await post(app, validPayload);
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ success: false, code: 'SERVICE_UNAVAILABLE' });
  });

  it('does not expose stored messages through any public endpoint', async () => {
    const { app } = buildTestApp();
    await post(app, validPayload);
    for (const path of [
      '/api/contact',
      '/api/messages',
      '/api/contact/messages',
      '/api/admin/messages',
    ]) {
      const res = await request(app).get(path);
      expect([404, 405]).toContain(res.status);
      expect(JSON.stringify(res.body)).not.toContain('jordan@example.com');
    }
    expect((await request(app).delete('/api/contact')).status).toBe(404);
  });

  it('sets security headers and hides the framework', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('CORS and origin checks', () => {
  const env = { CORS_ORIGINS: 'https://portfolio.example.test' };

  it('adds CORS headers only for approved origins', async () => {
    const { app } = buildTestApp({ env });
    const ok = await request(app)
      .options('/api/contact')
      .set('Origin', 'https://portfolio.example.test')
      .set('Access-Control-Request-Method', 'POST');
    expect(ok.headers['access-control-allow-origin']).toBe('https://portfolio.example.test');

    const bad = await request(app)
      .options('/api/contact')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects writes from unapproved origins (403) but allows approved and origin-less callers', async () => {
    const { app, repository } = buildTestApp({ env });
    const blocked = await request(app)
      .post('/api/contact')
      .set('Origin', 'https://evil.example')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(validPayload));
    expect(blocked.status).toBe(403);
    expect(repository.rows).toHaveLength(0);

    const allowed = await request(app)
      .post('/api/contact')
      .set('Origin', 'https://portfolio.example.test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(validPayload));
    expect(allowed.status).toBe(201);
  });
});

describe('health endpoints', () => {
  it('reports readiness and degrades to 503 without revealing details', async () => {
    const { app, repository } = buildTestApp();
    expect((await request(app).get('/api/health/ready')).body).toEqual({ status: 'ready' });
    repository.failWith = new RepositoryUnavailableError();
    const down = await request(app).get('/api/health/ready');
    expect(down.status).toBe(503);
    expect(down.body).toEqual({ status: 'unavailable' });
  });
});
