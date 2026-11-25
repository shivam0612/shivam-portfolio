import { randomBytes } from 'node:crypto';

// Crockford base32 (no I, L, O, U): unambiguous when read aloud or typed.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const REFERENCE_PATTERN = /^SP-[0-9A-HJKMNP-TV-Z]{6}-[0-9A-HJKMNP-TV-Z]{6}$/;

/** 60 bits of CSPRNG entropy, e.g. `SP-7K3QM9-XD4TWA`. Not derived from the database id. */
export function generateReference(): string {
  const bytes = randomBytes(12);
  let out = '';
  for (const b of bytes) out += ALPHABET[b & 31]; // 256 is divisible by 32 → no modulo bias
  return `SP-${out.slice(0, 6)}-${out.slice(6)}`;
}
