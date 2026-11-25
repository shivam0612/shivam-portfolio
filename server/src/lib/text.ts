import { createHash } from 'node:crypto';

// C0/C1 controls, bidi overrides and zero-width characters (kept: \n and \t handled separately).
/* eslint-disable no-control-regex -- this sanitiser deliberately targets control characters */
const UNSAFE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
/* eslint-enable no-control-regex */

/** Single-line text: no control characters, collapsed whitespace, trimmed. */
export function cleanSingleLine(value: string): string {
  return value.normalize('NFC').replace(UNSAFE, '').replace(/\s+/g, ' ').trim();
}

/** Multi-line text: normalised newlines, no control characters, bounded blank lines, trimmed. */
export function cleanMultiLine(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(UNSAFE, '')
    .replace(/[^\S\n]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape text for inclusion in HTML (used for the HTML part of notification e-mails). */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]!);
}

/** Make a value safe for an e-mail header: no line breaks, no angle brackets or quotes. */
export function headerSafe(value: string, maxLength = 120): string {
  return value
    .replace(/[\r\n<>"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Remove anything resembling credentials from an error string before storing or logging it. */
export function redactSecrets(value: string): string {
  return value
    .replace(/(pass(?:word)?|pwd|token|secret|apikey|api_key)\s*[=:]\s*\S+/gi, '$1=[redacted]')
    .replace(/:\/\/[^\s/@:]+:[^\s/@]+@/g, '://[redacted]@')
    .replace(/\s+/g, ' ')
    .trim();
}
