# Local setup

Everything below was written against the code in this repository. Commands assume a Unix-like shell.

## 1. Prerequisites

| Tool       | Version                        | Notes                                             |
| ---------- | ------------------------------ | ------------------------------------------------- |
| Node.js    | **20.19 or newer** (22 LTS ok) | `node -v`. Enforced by `engines` in package.json. |
| npm        | 10+                            | Ships with Node. The repo uses npm workspaces.    |
| PostgreSQL | 14+ (tested with 16)           | Local install, Docker, or a managed database.     |

## 2. Install

```bash
git clone <your-repo-url> shivam-portfolio
cd shivam-portfolio
npm install
```

`npm install` also runs `prisma generate` for the server (a `postinstall` step). That step downloads Prisma's
schema engine, so it needs normal internet access. See _Troubleshooting_ if you are behind a proxy.

## 3. Create the database

```bash
# as a PostgreSQL superuser, e.g. `psql -U postgres`
CREATE ROLE portfolio LOGIN PASSWORD 'choose-a-real-password';
CREATE DATABASE portfolio OWNER portfolio;
```

For a quick throw-away database with Docker:

```bash
docker run --name portfolio-db -e POSTGRES_USER=portfolio -e POSTGRES_PASSWORD=change_me \
  -e POSTGRES_DB=portfolio -p 5432:5432 -d postgres:16
```

## 4. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`. The only **required** value is `DATABASE_URL`:

```
DATABASE_URL=postgresql://portfolio:choose-a-real-password@localhost:5432/portfolio
```

Everything else has a safe default. The full list, with explanations, is in `server/.env.example`.
`server/.env` is git-ignored; never commit it. If a value is invalid the server refuses to start and names the
offending variable.

Email is optional while developing: with SMTP unset, messages are still stored and their notification status
stays `PENDING` until you configure SMTP (see [CONTACT_SYSTEM.md](./CONTACT_SYSTEM.md)).

## 5. Create the tables (migrations)

```bash
npm run db:migrate:deploy        # applies the committed migrations (use this everywhere, including production)
```

While _changing_ the schema you would use `npm run db:migrate:dev` instead, which also creates new migrations.

## 6. Run it

```bash
npm run dev
```

This starts both processes with `concurrently`:

- API on <http://localhost:4000> (`/api/health`, `/api/health/ready`, `POST /api/contact`)
- Site on <http://localhost:5173>. Vite proxies `/api` to the API, so the browser sees one origin.

Open <http://localhost:5173/contact>, send a message, and check it arrived:

```bash
psql "postgresql://portfolio:...@localhost:5432/portfolio" \
  -c 'select reference, name, email, "notificationStatus", "createdAt" from contact_messages order by "createdAt" desc limit 5;'
```

If the database is missing or not migrated, the API prints a clear setup message instead of a stack trace, and the
contact form shows a friendly error.

## 7. Personalise

| What                                             | Where                                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Name, headline, summary, contact info            | `client/src/data/profile.ts`                                                                   |
| Employment history                               | `client/src/data/experience.ts`                                                                |
| Skills (with resume evidence)                    | `client/src/data/skills.ts`                                                                    |
| Education / certifications                       | `client/src/data/education.ts`, `certifications.ts`                                            |
| Projects and their **status**                    | `client/src/data/projects.ts` (`Concept`, `In Progress`, `Completed`)                          |
| Diagram content                                  | `client/src/data/flow.ts`                                                                      |
| LinkedIn, GitHub, location, status label, domain | `client/.env` (copy `client/.env.example`). Blank = hidden. Only `https://` URLs are accepted. |

### Resume download

Put the real file at **`client/public/resume/Shivam_Patel_Resume.pdf`** (or `.docx`) and restart the dev server or
rebuild. The "Download Resume" buttons appear only when that file exists, so the site never links to a missing
file. **Commit the file** so your host deploys it.

### Updating a project when it becomes real

Edit its entry in `projects.ts`: set `status`, add real `screenshots` (files under `client/public/`), and add
`repoUrl` / `liveUrl` only when those exist. Nothing is shown for fields left `null`.

## 8. Quality checks

```bash
npm run lint           # ESLint across client + server
npm run typecheck      # TypeScript for both packages
npm test               # server (Vitest + Supertest) then client (Vitest + Testing Library)
npm run format:check   # Prettier
```

The server suite includes tests that talk to a **real PostgreSQL**; they are skipped unless you provide a
throw-away database:

```bash
TEST_DATABASE_URL=postgresql://portfolio:...@localhost:5432/portfolio_test npm test -w server
```

Apply the migrations to that test database first (`DATABASE_URL=<test url> npm run db:migrate:deploy`).

> **Warning:** these tests run `TRUNCATE TABLE contact_messages` before every test. Use a dedicated, throw-away
> database (for example `portfolio_test`). **Never** point `TEST_DATABASE_URL` at your development or production
> database, or you will lose every stored message.

## 9. Production build locally

```bash
npm run build                          # client (Vite) then server (prisma generate + tsc)
SERVE_CLIENT=true NODE_ENV=production npm start
```

With `SERVE_CLIENT=true` one Node process serves the API and the built site (with SPA fallback, immutable asset
caching and security headers) on `PORT`.

## Troubleshooting

**`Invalid server configuration: …`**: a variable in `server/.env` is malformed or out of range (for example
`NOTIFICATION_RETRY_INTERVAL_SECONDS` must be at least 5, `ADMIN_API_TOKEN` at least 32 characters). Fix the named
variable.

**`Cannot reach PostgreSQL or the schema is missing`**: check `DATABASE_URL`, that PostgreSQL is running, and that
you ran `npm run db:migrate:deploy`.

**`npm install` fails in `prisma generate` with `ENOTFOUND binaries.prisma.sh`**: your network blocks Prisma's engine
download. Allow `binaries.prisma.sh`, or configure `HTTPS_PROXY`. As a last resort `npm install --ignore-scripts`
works if a generated client already exists in `server/src/generated/`; otherwise run `npx prisma generate` from
`server/` on a machine with access.

**The browser shows "We couldn't reach the server"**: the API is not running, or in production `VITE_API_BASE_URL` /
`CORS_ORIGINS` do not match (see DEPLOYMENT.md). In dev, make sure `npm run dev` started both processes.

**CORS error in the browser console**: add the exact page origin (scheme + host + port, no trailing slash) to
`CORS_ORIGINS`.

**"You have sent several messages recently"**: the per-IP rate limit (default 5 per 15 minutes). Raise
`CONTACT_RATE_LIMIT_MAX` temporarily while testing. Behind a proxy, set `TRUST_PROXY` correctly or every visitor
shares one IP.

**Notification stays `PENDING`**: SMTP is not configured, or delivery failed and a retry is scheduled (exponential
back-off: 30 s, 1 min, 2 min, ... capped at 1 hour). Check the server log; see CONTACT_SYSTEM.md.

**Resume button missing**: the file must be named exactly `Shivam_Patel_Resume.pdf` (or `.docx`) inside
`client/public/resume/`, and the dev server/build must be restarted after adding it.
