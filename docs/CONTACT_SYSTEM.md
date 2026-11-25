# Contact system

A real, end-to-end pipeline: the form posts to the API, the API validates and stores the message in PostgreSQL, then
attempts an email notification through an outbox that retries on failure. Nothing is simulated.

```
Browser form ──POST /api/contact──▶ rate limit ▶ size limit ▶ Zod validation ▶ INSERT (Prisma)
                                                                                   │
                                          201 + reference ◀────────────────────────┤
                                                                                   ▼
                                                                    notification outbox ─▶ SMTP (Nodemailer)
                                                                     (PENDING → SENT | retry | FAILED)
```

The visitor's success response does **not** depend on email. A stored message is never discarded because SMTP failed.

## API

### `POST /api/contact`

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "organization": "Example Organization",
  "subject": "Professional Inquiry",
  "inquiryType": "Professional Opportunity",
  "message": "The visitor's message",
  "consent": true
}
```

`organization` is optional. Unknown fields are rejected (no mass assignment).

| Field          | Rule                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `name`         | required, 2-100 characters after trimming                                                                              |
| `email`        | required, valid address, at most 254 characters                                                                        |
| `organization` | optional, at most 120 characters                                                                                       |
| `subject`      | required, 3-150 characters. Control characters and line breaks are stripped (prevents header injection)                |
| `inquiryType`  | one of: Professional Opportunity, Supply Chain and Operations, Technology and Projects, Collaboration, General Inquiry |
| `message`      | required, 10-5000 characters, whitespace-only rejected                                                                 |
| `consent`      | must be `true`                                                                                                         |

The same rules run in the browser (`client/src/lib/contactSchema.ts`) for fast feedback, but the **server is the
authority** and re-validates everything.

**Responses**

| Status | When                                         | Body                                                                                                    |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `201`  | Stored                                       | `{ "success": true, "message": "Your message has been received.", "reference": "SP-XXXXXX-XXXXXX" }`    |
| `400`  | Invalid or unknown fields, bad JSON          | `{ "success": false, "code": "VALIDATION_ERROR", "message": "...", "fieldErrors": { "email": "..." } }` |
| `413`  | Body larger than 16 kB                       | generic message                                                                                         |
| `429`  | Rate limit exceeded                          | generic message plus `retryAfterSeconds` and a `Retry-After` header                                     |
| `500`  | Unexpected error (for example database down) | generic message only: no stack traces, SQL, credentials or hostnames                                    |

The `reference` is random (not derived from the database id) and non-guessable. Internal ids are never returned.

**Idempotency:** an identical resubmission (same email, subject and message) within a 10-minute window returns the
original reference instead of creating a second row or sending a second email. This covers double-clicks and retries
after a flaky connection.

### Other endpoints

| Endpoint                | Purpose                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `GET /api/health`       | Process liveness: `{"status":"ok"}`                                                   |
| `GET /api/health/ready` | Database reachable and migrated, otherwise `503 {"status":"unavailable"}`             |
| `/api/admin/*`          | Optional, token-protected; see below. **Not mounted unless `ADMIN_API_TOKEN` is set** |

There is **no public endpoint that lists, reads, edits or deletes messages**, and `GET /api/contact` returns 404.

## Data model (`server/prisma/schema.prisma`, table `contact_messages`)

| Column                                                                                                                                                          | Notes                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `id`                                                                                                                                                            | UUID primary key, internal only                                |
| `reference`                                                                                                                                                     | unique, public, e.g. `SP-7K3QM9-XD4TWA`                        |
| `name`, `email`, `organization`, `subject`, `inquiryType`, `message`, `consent`                                                                                 | exactly what the visitor submitted (after trimming/sanitising) |
| `status`                                                                                                                                                        | `NEW` (default), `READ`, `REPLIED`, `ARCHIVED`, `SPAM`         |
| `dedupeKey`                                                                                                                                                     | SHA-256 used for idempotency (unique)                          |
| `notificationStatus`, `notificationAttempts`, `notificationLastError`, `notificationLastAttemptAt`, `notificationNextAttemptAt`, `notifiedAt`, `acknowledgedAt` | the email outbox state                                         |
| `createdAt`, `updatedAt`                                                                                                                                        |                                                                |

Indexes: `createdAt`, `(status, createdAt)`, `(notificationStatus, notificationNextAttemptAt)`, `email`. All queries go
through Prisma (parameterised). The visitor's IP address is **not** stored with the message and request logs do not
include IP addresses.

Migrations live in `server/prisma/migrations/`. Apply with `npm run db:migrate:deploy`.

## Email notifications

Configure in `server/.env` (all of `SMTP_HOST`, `CONTACT_NOTIFICATION_EMAIL` and `CONTACT_FROM_EMAIL` are needed to
enable sending):

```
SMTP_HOST=smtp.your-provider.example
SMTP_PORT=587
SMTP_SECURE=false          # true for port 465 (implicit TLS); false for 587 (STARTTLS)
SMTP_USER=...
SMTP_PASS=...
CONTACT_NOTIFICATION_EMAIL=you@your-domain.example
CONTACT_FROM_EMAIL=portfolio@your-domain.example   # must be an address your provider permits
CONTACT_SEND_ACKNOWLEDGEMENT=false                 # true = also email the visitor a short receipt
```

The notification is a multipart email (plain-text and HTML parts) with `Reply-To` set to the visitor, so you can
answer directly. Visitor-supplied text is HTML-escaped in the HTML part, and header values are forced onto one line.

> Yahoo, Gmail and similar consumer mailboxes require an **app password** (not your login password) and may restrict
> which `From` addresses you can use. A transactional provider (Postmark, SendGrid, Resend SMTP, Amazon SES, ...)
> with a verified sender is more reliable. The `From` address in `CONTACT_FROM_EMAIL` must be one your provider
> allows, or delivery will be rejected.

### Outbox and retries

1. After the row is saved, the API attempts delivery immediately and **waits for that one attempt** before replying
   `201`. The attempt is bounded by `SMTP_TIMEOUT_MS` (default 8000, allowed 1000-60000), applied to the connection,
   greeting and socket phases. If your mail server hangs, a visitor's request can therefore take several multiples of
   that value; the browser gives up after 15 seconds and shows its "couldn't reach the server" style message even
   though the message was stored. Resubmitting is safe: the duplicate is detected and returns the original
   reference without a second row or email. Lower `SMTP_TIMEOUT_MS` (for example `4000`) if you want a tighter bound.
2. On failure the row stays `PENDING` with `notificationAttempts` incremented, `notificationLastError` set (secrets
   redacted) and `notificationNextAttemptAt` scheduled with exponential back-off: **30 s, 1 min, 2 min, 4 min, ...
   capped at 1 hour**.
3. A background worker polls every `NOTIFICATION_RETRY_INTERVAL_SECONDS` (default 60, minimum 5) and retries due rows. A
   short lease prevents two server instances sending the same email.
4. After `NOTIFICATION_MAX_ATTEMPTS` (default 8) the row becomes `FAILED`. It is never deleted.
5. If SMTP is not configured, rows simply stay `PENDING`; **configuring SMTP later delivers the backlog** automatically.

Observe it with SQL:

```sql
select notificationStatus, count(*) from contact_messages group by 1;
select reference, "createdAt", "notificationAttempts", "notificationLastError"
  from contact_messages where "notificationStatus" <> 'SENT' order by "createdAt";
```

(Column names are camelCase and must be double-quoted in PostgreSQL.)

## Admin API (optional)

Disabled unless `ADMIN_API_TOKEN` (32+ characters) is set. Every request needs `Authorization: Bearer <token>`
(compared in constant time). Without the header the API answers `401`.

```bash
TOKEN=...   # the value of ADMIN_API_TOKEN
curl -H "Authorization: Bearer $TOKEN" https://your-api.example/api/admin/status
curl -H "Authorization: Bearer $TOKEN" "https://your-api.example/api/admin/messages?status=NEW&limit=25&page=1"
curl -H "Authorization: Bearer $TOKEN" https://your-api.example/api/admin/messages/SP-7K3QM9-XD4TWA
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
     -d '{"status":"REPLIED"}' https://your-api.example/api/admin/messages/SP-7K3QM9-XD4TWA
```

`status` accepts `NEW`, `READ`, `REPLIED`, `ARCHIVED`, `SPAM`. The list responses include each message's notification
state, which is how you see whether an email went out. Treat the token like a password; rotate it by changing the
variable and redeploying. There is no browser admin UI.

## Security controls

- Server-side Zod validation; strict schemas (unknown keys rejected)
- 16 kB request body limit (`413`)
- Per-IP rate limit on `POST /api/contact` (default 5 per 15 minutes; `CONTACT_RATE_LIMIT_MAX`,
  `CONTACT_RATE_LIMIT_WINDOW_MINUTES`). Counters live in server memory; with several instances use a shared store.
  Set `TRUST_PROXY` correctly or all visitors look like one IP.
- Helmet security headers; CORS restricted to `CORS_ORIGINS`; `X-Powered-By` disabled
- Parameterised database access only (Prisma)
- Error responses never contain stack traces, SQL, credentials or internal details; logs redact secrets
- No secrets in the frontend (`VITE_*` variables are public by design)
- HTML-escaped visitor text in emails; header-injection characters stripped from single-line fields

**Spam:** rate limiting and idempotency are the only anti-abuse measures. If spam becomes a problem, add a CAPTCHA
(for example Cloudflare Turnstile): verify the token server-side in the controller before saving.

## Retention and deletion

**There is no automatic deletion.** Messages stay until you remove them. The Privacy page says this and tells visitors
to ask by email, quoting their reference. To delete one:

```sql
delete from contact_messages where reference = 'SP-7K3QM9-XD4TWA';
```

If you adopt a retention period (for example "delete after 12 months"), implement it as an explicit, documented
scheduled job and update `client/src/pages/Privacy.tsx` to match.

## Tests

`server/tests/` covers: valid submissions (201, persisted, reference format), every required-field/format/enum/
length/consent failure, oversized bodies (413), rate limiting (429), idempotent resubmission, notification failure
not losing the message, retry/back-off/exhaustion, concurrent-instance lease, internal-error leak checks, no public
listing endpoints, admin authentication, and a real-SMTP delivery test against a local SMTP server. A further suite
runs the repository against a real PostgreSQL when `TEST_DATABASE_URL` is set (it truncates the table, so use a
throw-away database). See `docs/SETUP.md`.
