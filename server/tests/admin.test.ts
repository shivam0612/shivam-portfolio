import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ADMIN_TOKEN, FakeMailer, buildTestApp, validPayload } from './helpers.js';

const env = { ADMIN_API_TOKEN: ADMIN_TOKEN };
const auth = { Authorization: `Bearer ${ADMIN_TOKEN}` };
const submit = (app: Parameters<typeof request>[0], over: object = {}) =>
  request(app)
    .post('/api/contact')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ ...validPayload, ...over }));

describe('admin API', () => {
  it('does not exist when ADMIN_API_TOKEN is not configured', async () => {
    const { app } = buildTestApp();
    expect((await request(app).get('/api/admin/messages').set(auth)).status).toBe(404);
  });

  it('requires a valid bearer token', async () => {
    const { app } = buildTestApp({ env });
    const none = await request(app).get('/api/admin/messages');
    expect(none.status).toBe(401);
    expect(none.headers['www-authenticate']).toMatch(/Bearer/);
    expect(
      (await request(app).get('/api/admin/messages').set({ Authorization: 'Bearer wrong' })).status,
    ).toBe(401);
    expect(
      (await request(app).get('/api/admin/messages').set({ Authorization: ADMIN_TOKEN })).status,
    ).toBe(401);
  });

  it('lists messages with notification status, without internal ids or dedupe keys', async () => {
    const mailer = new FakeMailer();
    mailer.failOwnerWith = new Error('smtp down');
    const { app } = buildTestApp({ env, mailer });
    const created = await submit(app);

    const res = await request(app).get('/api/admin/messages').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    const item = res.body.items[0];
    expect(item.reference).toBe(created.body.reference);
    expect(item.notification).toMatchObject({
      status: 'PENDING',
      attempts: 1,
      lastError: expect.stringContaining('smtp down'),
    });
    expect(item).not.toHaveProperty('id');
    expect(item).not.toHaveProperty('dedupeKey');
  });

  it('reads one message, updates its status, and validates input', async () => {
    const { app } = buildTestApp({ env });
    const { body } = await submit(app);
    const url = `/api/admin/messages/${body.reference}`;

    expect((await request(app).get(url).set(auth)).body.item.status).toBe('NEW');
    const patched = await request(app).patch(url).set(auth).send({ status: 'READ' });
    expect(patched.status).toBe(200);
    expect(patched.body.item.status).toBe('READ');

    expect((await request(app).patch(url).set(auth).send({ status: 'BOGUS' })).status).toBe(400);
    expect(
      (await request(app).patch(url).set(auth).send({ status: 'READ', reference: 'X' })).status,
    ).toBe(400);
    expect((await request(app).get('/api/admin/messages/SP-AAAAAA-BBBBBB').set(auth)).status).toBe(
      404,
    );
    expect((await request(app).get('/api/admin/messages/not-a-ref').set(auth)).status).toBe(404);
    expect((await request(app).patch(url).send({ status: 'READ' })).status).toBe(401);
  });

  it('filters by status and reports notification counts', async () => {
    const { app } = buildTestApp({ env });
    const a = await submit(app);
    await submit(app, { message: 'A second distinct message for filtering.' });
    await request(app)
      .patch(`/api/admin/messages/${a.body.reference}`)
      .set(auth)
      .send({ status: 'ARCHIVED' });

    const archived = await request(app).get('/api/admin/messages?status=ARCHIVED').set(auth);
    expect(archived.body.total).toBe(1);
    expect((await request(app).get('/api/admin/messages?status=NOPE').set(auth)).status).toBe(400);

    const status = await request(app).get('/api/admin/status').set(auth);
    expect(status.body).toMatchObject({
      success: true,
      emailConfigured: true,
      notifications: { SENT: 2, PENDING: 0, FAILED: 0 },
    });
  });
});
