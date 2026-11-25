# Shivam Patel: Supply Chain, Operations & Technology Portfolio

A full-stack personal portfolio: a React + Framer Motion front end and a Node/Express + PostgreSQL back end with a
working contact system (validation, persistence, email notifications with a retrying outbox, rate limiting).

It presents three identities accurately: supply chain / warehouse operations, computer science / technology, and
operations leadership / continuous improvement. It does **not** present Shivam as a senior software engineer, and it
contains no invented achievements, metrics, links, testimonials or project outcomes.

```
client/   React 19, Vite, TypeScript, Framer Motion, React Router, React Hook Form + Zod, plain CSS
server/   Node 20+, Express, Prisma + PostgreSQL, Zod, Nodemailer, Helmet, express-rate-limit, Pino
docs/     SETUP.md · DEPLOYMENT.md · CONTACT_SYSTEM.md
```

## Quick start

Requires Node 20.19+ and PostgreSQL 14+. Full steps are in [docs/SETUP.md](docs/SETUP.md).

```bash
npm install
cp server/.env.example server/.env        # set DATABASE_URL (the only required value)
npm run db:migrate:deploy                  # create the tables
npm run dev                                # API :4000 + site :5173 (proxied)
```

Open <http://localhost:5173>. The contact form at `/contact` writes to your database.

| Command                                       | What it does                                       |
| --------------------------------------------- | -------------------------------------------------- |
| `npm run dev`                                 | API and site together                              |
| `npm run build`                               | Production build of client and server              |
| `SERVE_CLIENT=true npm start`                 | One Node process serving API + built site          |
| `npm test`                                    | Server tests, then client tests                    |
| `npm run lint` / `typecheck` / `format:check` | Static checks                                      |
| `npm run db:migrate:deploy`                   | Apply committed migrations (use in production too) |

## What is configurable (and hidden until you provide it)

Nothing below is invented. Each item is **hidden** until you supply the real value.

| Item                                     | How                                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Resume download button                   | Commit `client/public/resume/Shivam_Patel_Resume.pdf` (or `.docx`)                 |
| LinkedIn / GitHub / location             | `VITE_LINKEDIN_URL`, `VITE_GITHUB_URL`, `VITE_LOCATION` in `client/.env`           |
| "Open to Professional Opportunities"     | `VITE_SHOW_AVAILABILITY=true` (off until you confirm)                              |
| Canonical URLs, sitemap, share image URL | `VITE_SITE_URL=https://your-domain` (nothing is emitted without it)                |
| Certification credential links           | `credentialUrl` in `client/src/data/certifications.ts` (all `null` today)          |
| Project status, screenshots, repo links  | `client/src/data/projects.ts`. All four are `Concept` and stay that way until real |
| Email delivery                           | SMTP variables in `server/.env`                                                    |
| Skip the animated intro entirely         | `VITE_DISABLE_INTRO=true`                                                          |

All personal content lives in `client/src/data/` (`profile`, `experience`, `skills`, `education`, `certifications`,
`projects`, `flow`, `navigation`). Employment dates are displayed exactly as supplied.

## Features

- **Hero control-tower diagram**: six nodes (warehouse → inventory → order processing → data systems → analytics →
  process optimization, looping back), SVG packets flowing along the path, keyboard-operable nodes with tooltips.
- **"Where Operations Meets Technology"**: the same diagram as a selector. Each step shows what it is, why it matters
  and how it relates to performance, with **"From my resume"** kept visibly separate from **"Illustrative idea, not
  something I have implemented"**.
- **Custom cursor**: dot plus trailing ring with link/button/card/diagram states and `EXPLORE` labels; transforms inside
  one `requestAnimationFrame` loop with no React re-render per mouse move; off for touch and reduced motion.
- **Motion system**: intro that appears only on slow loads, word-mask headline, scroll reveals that play once,
  counters, animated timeline rail, magnetic CTAs, pointer-follow glow and a travelling border light on cards, route
  transitions that never delay navigation, scroll progress bar, back-to-top, scroll-spy navigation.
- **Experience**: accessible accordion timeline plus a chart of the employment periods exactly as listed.
- **Skills**: filterable by category, each skill citing resume evidence. No percentages or progress bars.
- **Contact**: validated end to end, loading/success/error states, server-issued reference, preserved input on errors,
  duplicate-submit protection, accessible announcements.
- **Backend**: Zod validation, 16 kB body limit, rate limiting, Helmet, CORS allow-list, idempotent resubmission,
  PostgreSQL via Prisma, email outbox with exponential back-off, optional token-protected admin API. No public
  endpoint lists messages.
- **Accessibility**: skip link, semantic landmarks, labelled fields with `aria-invalid`/described errors, visible focus
  everywhere, dialog focus trap, `prefers-reduced-motion` support, status shown by icon + text (never colour alone).
- **SEO**: per-page titles/descriptions, Open Graph/Twitter tags with a generated `og-image.png`, JSON-LD `Person`
  (only configured links), `robots.txt`, sitemap and canonicals when a domain is configured.

## What was actually verified

Run in a Linux sandbox with PostgreSQL 16, Chromium (Playwright) and a local SMTP server.

**Automated (all passing at hand-off)**

- Server: **60 tests**: 51 unit/API tests plus 9 against a real PostgreSQL.
- Client: **74 tests**: routing, navigation, mobile menu focus handling, form validation / loading / success / error /
  server-error mapping, API client status handling, accordion keyboard behaviour, skill filtering, diagram
  real-vs-illustrative content, cursor gating, SEO, scroll-spy, plus content-integrity guards (dates verbatim, no
  percentages beyond the resume's own 99%, every project a `Concept`, no invented links).
- ESLint, Prettier and `tsc` are clean. `npm audit` reports **0 vulnerabilities**. (It initially flagged 4 high ones
  that came from the `prisma` CLI's own dependencies, not from application code; bumping Prisma 7.10.0 → 7.10.1
  cleared them and all server tests, including the real-PostgreSQL ones, still pass.)
- The client production build and the server's TypeScript build both succeed.

**Real-browser checks (Chromium)**

- 9 routes × 6 widths (360, 390, 768, 1024, 1440, 1920): no horizontal overflow, zero console errors. The overflow
  check was validated with a negative control (it catches an injected overflow).
- Mobile menu (focus in, Escape, focus return), cursor states (link/button/card/diagram/input), none on touch, none
  under reduced motion, tooltip on hover/focus, visible keyboard focus.
- Intro: skipped on fast loads, shown on slow loads, skippable, once per session.
- **Contact end to end**: browser form → API → PostgreSQL row → email actually delivered to a live SMTP server
  (Reply-To = visitor) → status visible via the admin API. Also: API down (friendly error, input preserved), SMTP
  outage (message stored and 201 returned, then delivered automatically by the outbox after SMTP recovered), rate
  limit surfaced in the UI, double-click sends one request, no public listing endpoints.
- Production build served by the Node server: direct URLs and SPA fallback, immutable asset caching, CSP headers
  with fonts/diagram/forms working and no violations.
- Resume button appears and downloads as `Shivam_Patel_Resume.pdf` only when a file exists (checked with a temporary
  placeholder, since removed); an unsafe `javascript:` profile URL is rejected; canonical/sitemap only with a domain.

**Lighthouse** (production build, sandbox with a single CPU core, so numbers are noisy):
Accessibility **100**, Best Practices **100**, SEO **100**; Performance **96-99 desktop**, **62-72 mobile**
(simulated slow 4G, 4× CPU slowdown). Early in testing mobile performance was 36; the fixes were response
compression (the server had none), replacing perpetual JS-driven animations with CSS, and pausing off-screen SVG
animation. Remaining mobile cost is mostly JavaScript execution and the choreographed hero reveal. If you want the
highest score, set `VITE_DISABLE_INTRO=true`, and measure again on the real deployed URL (PageSpeed Insights).

## What was NOT verified

- **Prisma CLI commands** (`prisma generate`, `prisma migrate deploy`) could not run in the sandbox, which blocks the
  Prisma engine download. So `npm install`'s `postinstall`, the server's `npm run build` as a single command, and the
  migration command are untested here (I ran the server's `tsc` step directly, and applied the committed migration SQL
  with `psql`; the app and tests ran against that schema). The Prisma 7.10.1 bump was tested with the previously
  generated client. Run `npm install`, `npm run db:migrate:deploy`, `npm run build` and `npm test` once on your machine.
- **No real deployment** was performed. `docs/DEPLOYMENT.md` is instructions only; the Netlify/Vercel rewrite files
  were not tried on those platforms.
- **Real email providers** (Yahoo, Gmail, SES, ...) were not tested, only a local SMTP server. Consumer mailboxes need
  app passwords and may reject unverified `From` addresses.
- Only Chromium was exercised: no Safari/Firefox, no real phones, no screen reader or manual keyboard-only pass.
- Lighthouse on the deployed site, and any legal review of the privacy text, are still to do.

## Decisions worth a look

- The career chart draws the three employment periods **as listed**, which overlap. They are shown without comment, as
  requested. Delete `<CareerSpanChart />` from `client/src/pages/Experience.tsx` if you would rather not draw attention
  to that.
- "Team enablement" is folded into the **Warehouse Operations** step of the six-step diagram, so the diagram keeps the
  six steps you specified.
- Metrics are limited to what the resume supports. "4+ years" is attributed to the resume summary, and the
  certification count is labelled as listed, not independently verified.
- The privacy page describes how this system really works (no analytics or cookies, no automatic deletion, rate-limit
  counters held in memory). If you change the system, update `client/src/pages/Privacy.tsx`.

## Project layout

```
client/src/
  components/  animations/ cursor/ diagram/ experience/ hero/ intro/ layout/ navigation/ projects/ skills/ contact/ common/ sections/ education/
  data/        all personal content and configuration
  hooks/ lib/  scroll-spy, media queries, API client, form schema, SEO
  pages/       Home, About, Experience, Projects, ProjectDetail, Skills, Contact, Privacy, NotFound (route-level code splitting)
  styles/      tokens, base, layout, components, sections, pages
  test/        Vitest + Testing Library
server/src/    config/ controllers/ middleware/ repositories/ routes/ services/ validators/ lib/ app.ts server.ts
server/prisma/ schema.prisma + migrations
server/tests/  Vitest + Supertest (+ real-PostgreSQL and real-SMTP suites)
```
