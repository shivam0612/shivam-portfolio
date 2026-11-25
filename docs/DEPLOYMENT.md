# Deployment

> **Status: not deployed.** No deployment has been performed or verified from this repository. The steps below
> describe how to deploy it and what each setting does. The production code path itself (Node serving the built site
> and API, security headers, form submission) was exercised locally; see the README for exactly what was tested.

You need three things in production: a **PostgreSQL database that persists** (managed Postgres, not a container
filesystem), a **Node 20.19+ process** for the API, and the **built React app**. Do not use SQLite or local files for
contact messages on a host whose disk is ephemeral.

## Option A: one service (simplest)

One Node process serves the API **and** the built site. Same origin, so no CORS and no `VITE_API_BASE_URL`.
Works on any host that runs a Node web service (Render, Railway, Fly.io, a VPS, ...).

**Build command**

```bash
npm ci && npm run build
```

**Release / pre-start command** (run once per deploy, before starting the new version)

```bash
npm run db:migrate:deploy
```

**Start command**

```bash
npm start
```

**Environment variables** (set in the host's dashboard, never in git)

| Variable                                                      | Value                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                                    | `production`                                                                                    |
| `DATABASE_URL`                                                | Your managed PostgreSQL connection string (add `?sslmode=require` if the provider requires TLS) |
| `SERVE_CLIENT`                                                | `true`                                                                                          |
| `CORS_ORIGINS`                                                | Your public site origin, e.g. `https://your-domain.example`                                     |
| `TRUST_PROXY`                                                 | `1` on hosts with one reverse proxy (most platforms) so rate limiting sees real client IPs      |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASS` | Your email provider (see CONTACT_SYSTEM.md)                                                     |
| `CONTACT_NOTIFICATION_EMAIL`                                  | Where new-message notifications go                                                              |
| `CONTACT_FROM_EMAIL`                                          | Sender address your SMTP provider allows (often must be a verified sender)                      |
| `ADMIN_API_TOKEN` (optional)                                  | `openssl rand -hex 32`. Leave blank to disable the admin API entirely                           |

**Frontend build-time variables** are read during `npm run build` on the same host, so set them there too:

| Variable                                                | Purpose                                                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`                                         | Your real domain, e.g. `https://your-domain.example`. Turns on canonical URLs, `og:url`, `og:image`, `sitemap.xml` and the `Sitemap:` line in `robots.txt` |
| `VITE_LINKEDIN_URL`, `VITE_GITHUB_URL`, `VITE_LOCATION` | Optional; blank = hidden                                                                                                                                   |
| `VITE_SHOW_AVAILABILITY`                                | `true` only once you want "Open to Professional Opportunities" shown                                                                                       |

`VITE_*` values are embedded in the public JavaScript bundle. Never put secrets in them.

**Health checks:** `GET /api/health` (process is up) and `GET /api/health/ready` (database reachable and migrated;
returns 503 otherwise). Point the platform's health check at `/api/health/ready`.

## Option B: split hosting

Static site on one host (Vercel, Netlify, Cloudflare Pages, ...) and the API on another.

1. **API:** deploy `server/` exactly as in Option A, but with `SERVE_CLIENT=false` and
   `CORS_ORIGINS=https://your-site-origin`. The API needs a public HTTPS URL, e.g. `https://api.your-domain.example`.
2. **Site:** build `client/` with
   - `VITE_API_BASE_URL=https://api.your-domain.example`
   - `VITE_SITE_URL=https://your-domain.example`

   Output directory is `client/dist`. The app is a single-page app, so unknown paths must rewrite to `index.html`.
   This repo includes `client/public/_redirects` (Netlify, Cloudflare Pages) and `client/vercel.json` (Vercel);
   these are standard syntax but **have not been tried on those platforms**.

3. Verify from the deployed site: open `/contact`, submit a message, then confirm the row exists in the database.
   A CORS problem shows up as a console error and the form's "couldn't reach the server" message.

Static hosts do not add the security headers that Option A's Node server sends (Helmet's CSP, HSTS, etc.). Configure
equivalent headers in the host if you need them.

## Database

- Use a managed PostgreSQL service with automated backups. Contact messages are personal data; see the retention
  notes in CONTACT_SYSTEM.md.
- The app opens a small connection pool. On serverless/low-connection plans use the provider's pooled connection
  string in `DATABASE_URL`.
- Run `npm run db:migrate:deploy` on every release. It only applies migrations that have not run yet.
- The Prisma CLI is a runtime dependency of the server package precisely so the release command works in production
  builds. If your host prunes dev dependencies, keep `prisma` installed or run the migration from CI.

## Custom domain and HTTPS

Point your domain at the host and enable HTTPS (all of the platforms above do this automatically). Then set
`VITE_SITE_URL` and `CORS_ORIGINS` to the final `https://` origin and redeploy so canonical URLs and the sitemap use it.

## Pre-launch checklist

- [ ] Real resume committed at `client/public/resume/Shivam_Patel_Resume.pdf` and the button appears
- [ ] `VITE_SITE_URL` set to the real domain (view-source shows a canonical link)
- [ ] LinkedIn / GitHub / location set **only** if they are real and wanted
- [ ] `VITE_SHOW_AVAILABILITY` set deliberately
- [ ] SMTP configured; a test submission produces an email and the row shows `notificationStatus = SENT`
- [ ] `CORS_ORIGINS` is the exact production origin; `TRUST_PROXY` matches your platform
- [ ] `/api/health/ready` returns `ready`; database backups enabled
- [ ] Projects in `projects.ts` still say `Concept` unless real, verified work exists
- [ ] Privacy page reviewed by you (it describes this system accurately but is not legal advice)
- [ ] Run Lighthouse against the deployed URL (it has not been run for this project)
