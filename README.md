# Smile Nikoro Portfolio and CMS

A responsive Next.js portfolio and private content-management platform for
Smile Nikoro, focused on environmental engineering, HSE and sustainability.
Public pages display published content; drafts and archived content remain
available only in the authenticated admin.

## Requirements

- Node.js 20.9 or later
- PostgreSQL
- Supabase Storage (or an equivalent implementation of the configured storage
  service)
- Resend account and a verified sender address for transactional email

## Local setup

```powershell
npm install
Copy-Item .env.example .env
```

Set the environment variables in `.env.local`:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: a randomly generated secret. Generate one with
  `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`.
- `NEXT_PUBLIC_SITE_URL`: canonical site URL, including scheme.
- `ADMIN_SETUP_TOKEN`: a long, random, one-time value used only to create the
  first administrator.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: Supabase project URL and
  server-only service-role key.
- `SUPABASE_PUBLIC_BUCKET` and `SUPABASE_PRIVATE_BUCKET`: storage bucket names.
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL`: Resend API key and verified sender.

Never commit `.env.local`, expose the Supabase service-role key to the browser,
or use production credentials in local development.

Create the schema and generate the Prisma client, then start the app:

```powershell
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then visit
`/admin/setup` and create the first administrator using `ADMIN_SETUP_TOKEN`.
Setup closes automatically after the first account is created. Remove the
one-time setup token from the deployment environment afterward. The initial
setup creates the portfolio profile and verified baseline education,
experience, certification and site-settings records; review these in the
dashboard before publishing.

## CMS and security features

- Admin authentication uses credentials, database-backed roles, secure
  sessions, login throttling, password reset and authenticated password
  changes. Public registration is disabled.
- Projects, articles, research, publications, experience, education and
  certifications support create, edit, publish, archive and delete workflows.
- Rich text is sanitized on the server. Public routes query published records
  only.
- Media uploads are validated by type, size and file signature. CV versions and
  documents are managed separately; private file downloads require an
  authenticated session.
- Contact submissions are validated, rate-limited and stored in PostgreSQL.
  Email delivery is sent through Resend; notification delivery status is
  recorded with each enquiry.
- Administrative changes are recorded in the audit log.

## Storage configuration

Create both configured Supabase buckets before uploading:

- The public bucket is for content deliberately published to the website.
  Public reads are required for its public objects.
- The private bucket must remain private. Access is granted through short-lived
  signed URLs after server-side authorization.
- Upload and deletion operations use the server-only service-role key. Do not
  grant browser clients direct service-role access.

## Deployment and operations

Use a Node.js-compatible Next.js host and a managed PostgreSQL database. Set
all required environment variables in the hosting provider, set
`NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, and apply committed
migrations with `npm run db:migrate` during deployment. Do not use
`npm run db:dev` in production.

Back up PostgreSQL and Supabase Storage independently; database backups do not
include uploaded file contents. Test restoration periodically. Configure the
Resend sender domain and DNS records before enabling contact notifications or
password resets. Monitor application logs for delivery errors and storage or
database failures.

No hosted database, storage buckets, email provider credentials or production
secrets are included in this repository. Those services must be provisioned and
configured before the CMS can run outside a local build.

## Routes

- `/`, `/about`, `/experience`, `/projects`, `/research`, `/publications`,
  `/insights`, `/certifications`, `/contact` — public portfolio
- `/admin/login`, `/admin/setup`, `/admin/forgot-password` — authentication
- `/admin` — protected dashboard, with content, media, CV/documents, enquiries,
  profile, settings and security sections
- `/cv` — current public CV, when one has been explicitly selected

## Checks and Tests

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

## Production Handover Checklist

- [ ] Managed PostgreSQL database provisioned (e.g. Supabase, Railway, Neon).
- [ ] Database migrations deployed (`npm run db:migrate`).
- [ ] Supabase storage buckets created (`portfolio-public` and `portfolio-private`).
- [ ] Resend sender domain verified with SPF/DKIM and configured.
- [ ] `ADMIN_SETUP_TOKEN` used once to create Smile's primary admin account, then unset.
- [ ] Production custom domain attached to hosting (e.g. Vercel) and `NEXT_PUBLIC_SITE_URL` updated.
- [ ] Periodic PostgreSQL pg_dump backups configured.
