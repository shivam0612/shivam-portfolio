import type { AddressInfo } from 'node:net';
import { simpleParser, type ParsedMail } from 'mailparser';
import { SMTPServer } from 'smtp-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { EmailConfig } from '../src/config/env.js';
import type { StoredContactMessage } from '../src/repositories/types.js';
import { SmtpMailer } from '../src/services/mailer.js';

/** Talks to a real (local, in-process) SMTP server to prove the Nodemailer integration works. */
describe('SmtpMailer against a real SMTP server', () => {
  const received: ParsedMail[] = [];
  let server: SMTPServer;
  let port: number;

  const msg = {
    reference: 'SP-AAAAAA-BBBBBB',
    name: 'Eve <script>',
    email: 'eve@example.com',
    organization: 'Example & Co',
    subject: 'Hello there',
    inquiryType: 'Collaboration',
    message: 'Line one\nLine two <b>bold</b>',
    createdAt: new Date('2026-10-11T12:00:00Z'),
    acknowledgedAt: null,
  } as unknown as StoredContactMessage;

  const config = (over: Partial<EmailConfig> = {}): EmailConfig => ({
    host: '127.0.0.1',
    port,
    secure: false,
    user: null,
    pass: null,
    timeoutMs: 3000,
    notifyTo: 'owner@example.test',
    from: 'Portfolio <no-reply@example.test>',
    ...over,
  });

  beforeAll(async () => {
    server = new SMTPServer({
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      onData(stream, _session, callback) {
        simpleParser(stream).then((mail) => {
          received.push(mail);
          callback();
        }, callback);
      },
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.server.address() as AddressInfo).port;
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('delivers the owner notification with correct headers, Reply-To and escaped HTML', async () => {
    await new SmtpMailer(config(), 'Shivam Patel Portfolio').sendOwnerNotification(msg);
    const mail = received.at(-1)!;
    expect(mail.from?.value[0]?.address).toBe('no-reply@example.test');
    expect(mail.to).toMatchObject({ value: [{ address: 'owner@example.test' }] });
    expect(mail.replyTo?.value[0]?.address).toBe('eve@example.com');
    expect(mail.subject).toContain('Collaboration');
    expect(mail.text).toContain('SP-AAAAAA-BBBBBB');
    expect(mail.text).toContain('Line two <b>bold</b>');
    expect(String(mail.html)).toContain('&lt;b&gt;bold&lt;/b&gt;');
    expect(String(mail.html)).not.toContain('<script>');
  });

  it('delivers the optional visitor acknowledgment to the visitor', async () => {
    await new SmtpMailer(config(), 'Shivam Patel Portfolio').sendVisitorAcknowledgement(msg);
    const mail = received.at(-1)!;
    expect(mail.to).toMatchObject({ value: [{ address: 'eve@example.com' }] });
    expect(mail.text).toContain('Your message has been received');
  });

  it('rejects (so the outbox can retry) when the SMTP server is unreachable', async () => {
    await expect(
      new SmtpMailer(config({ port: 1 }), 'Portfolio').sendOwnerNotification(msg),
    ).rejects.toThrow();
  });
});
