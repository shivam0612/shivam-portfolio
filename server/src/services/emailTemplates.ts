import { escapeHtml, headerSafe } from '../lib/text.js';
import type { StoredContactMessage } from '../repositories/types.js';

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/** Notification to the site owner. Visitor-supplied text is escaped in the HTML part. */
export function buildOwnerNotification(msg: StoredContactMessage, siteName: string): EmailContent {
  const subject = `[${headerSafe(siteName, 40)}] ${headerSafe(msg.inquiryType, 64)}: ${headerSafe(msg.subject, 100)}`;
  const received = msg.createdAt.toISOString();
  const text = [
    `New message via ${siteName}`,
    '',
    `Reference:    ${msg.reference}`,
    `Received:     ${received}`,
    `Name:         ${msg.name}`,
    `Email:        ${msg.email}`,
    `Organization: ${msg.organization ?? '—'}`,
    `Inquiry type: ${msg.inquiryType}`,
    `Subject:      ${msg.subject}`,
    '',
    msg.message,
    '',
    '— Reply to this e-mail to respond directly to the sender.',
  ].join('\n');

  const row = (label: string, value: string) =>
    `<tr><th align="left" style="padding:4px 12px 4px 0;color:#555;font-weight:600">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;
  const html = `<!doctype html><html><body style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;color:#111">
<h2 style="margin:0 0 12px">New message via ${escapeHtml(siteName)}</h2>
<table role="presentation" cellspacing="0" cellpadding="0">
${row('Reference', msg.reference)}${row('Received', received)}${row('Name', msg.name)}${row('Email', msg.email)}${row('Organization', msg.organization ?? '—')}${row('Inquiry type', msg.inquiryType)}${row('Subject', msg.subject)}
</table>
<pre style="white-space:pre-wrap;font:inherit;margin:16px 0;padding:12px;background:#f4f4f5;border-radius:6px">${escapeHtml(msg.message)}</pre>
<p style="color:#555;margin:0">Reply to this e-mail to respond directly to the sender.</p>
</body></html>`;
  return { subject, text, html };
}

/** Optional acknowledgment to the visitor. Makes no claim beyond "your message was received". */
export function buildVisitorAcknowledgement(
  msg: StoredContactMessage,
  ownerName: string,
): EmailContent {
  const subject = `Your message was received (${msg.reference})`;
  const text = [
    `Hello ${msg.name},`,
    '',
    `Thank you for contacting ${ownerName}. Your message has been received.`,
    `Your reference number is ${msg.reference}.`,
    '',
    'This is an automated confirmation; please do not rely on it as a guarantee of a reply time.',
  ].join('\n');
  const html = `<!doctype html><html><body style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:15px;color:#111">
<p>Hello ${escapeHtml(msg.name)},</p>
<p>Thank you for contacting ${escapeHtml(ownerName)}. Your message has been received.</p>
<p>Your reference number is <strong>${escapeHtml(msg.reference)}</strong>.</p>
<p style="color:#555">This is an automated confirmation; please do not rely on it as a guarantee of a reply time.</p>
</body></html>`;
  return { subject, text, html };
}
