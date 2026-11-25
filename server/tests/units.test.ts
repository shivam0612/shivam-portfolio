import { describe, expect, it } from 'vitest';
import { ConfigError, parseConfig } from '../src/config/env.js';
import { REFERENCE_PATTERN, generateReference } from '../src/lib/reference.js';
import { cleanMultiLine, cleanSingleLine, escapeHtml, redactSecrets } from '../src/lib/text.js';
import { buildOwnerNotification } from '../src/services/emailTemplates.js';
import type { StoredContactMessage } from '../src/repositories/types.js';

describe('references', () => {
  it('are well-formed, unique, and not derived from sequential ids', () => {
    const refs = new Set(Array.from({ length: 5000 }, generateReference));
    expect(refs.size).toBe(5000);
    for (const ref of refs) expect(ref).toMatch(REFERENCE_PATTERN);
  });
});

describe('text sanitisation', () => {
  it('cleans single-line and multi-line text', () => {
    expect(cleanSingleLine('  a \n\t b\u0000 ')).toBe('a b');
    expect(cleanMultiLine('line1\r\n\r\n\r\n\r\nline2   \n')).toBe('line1\n\nline2');
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;',
    );
    expect(redactSecrets('password=abc token: xyz')).toBe('password=[redacted] token=[redacted]');
  });
});

describe('owner notification e-mail', () => {
  it('escapes visitor-supplied HTML and keeps header values on one line', () => {
    const msg = {
      reference: 'SP-AAAAAA-BBBBBB',
      name: '<b>Eve</b>',
      email: 'eve@example.com',
      organization: null,
      subject: 'Hi\r\nBcc: x@y.z',
      inquiryType: 'General Inquiry',
      message: '<script>alert(1)</script>',
      createdAt: new Date('2026-10-11T12:00:00Z'),
    } as StoredContactMessage;
    const mail = buildOwnerNotification(msg, 'Portfolio');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
    expect(mail.html).not.toContain('<b>Eve</b>');
    expect(mail.subject).not.toMatch(/[\r\n]/);
  });
});

describe('configuration', () => {
  const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

  it('fails with a clear list of problems when required settings are missing or invalid', () => {
    expect(() => parseConfig({})).toThrow(ConfigError);
    try {
      parseConfig({ DATABASE_URL: 'mysql://nope', PORT: '99999' });
    } catch (e) {
      expect((e as ConfigError).problems.join(' ')).toMatch(/DATABASE_URL.*postgresql:\/\//);
      expect((e as ConfigError).problems.join(' ')).toMatch(/PORT/);
    }
  });

  it('treats empty strings as unset and defaults to no e-mail', () => {
    const c = parseConfig({ ...base, SMTP_HOST: '', SMTP_USER: '', CORS_ORIGINS: '' });
    expect(c.email).toBeNull();
    expect(c.corsOrigins).toEqual(['http://localhost:5173']);
    expect(c.adminApiToken).toBeNull();
  });

  it('rejects partial e-mail configuration and orphaned credentials', () => {
    expect(() => parseConfig({ ...base, SMTP_HOST: 'smtp.example.test' })).toThrow(
      /partially configured/,
    );
    expect(() =>
      parseConfig({
        ...base,
        SMTP_HOST: 'h',
        CONTACT_NOTIFICATION_EMAIL: 'o@e.co',
        CONTACT_FROM_EMAIL: 'f@e.co',
        SMTP_USER: 'u',
      }),
    ).toThrow(/together/);
    expect(() => parseConfig({ ...base, CONTACT_SEND_ACKNOWLEDGEMENT: 'true' })).toThrow(
      /requires the SMTP/,
    );
  });

  it('requires a long admin token when one is provided', () => {
    expect(() => parseConfig({ ...base, ADMIN_API_TOKEN: 'short' })).toThrow(/32 characters/);
  });
});
