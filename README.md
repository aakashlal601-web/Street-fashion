# STREET FASHION — Production E-Commerce App

Next.js 14 (App Router) storefront + admin panel, backed by PostgreSQL, NextAuth
credential-based admin auth, and Cloudinary image storage. Same black/white/lime
streetwear UI as the prototype — now running on a real database instead of
browser-side storage.

## What changed from the prototype

| Prototype | Production |
|---|---|
| Client-side persistent storage | PostgreSQL via Prisma |
| Hardcoded `admin` / `street2026` in the UI | Bcrypt-hashed credentials in the database, created via a server-only script |
| Base64 images in storage | Uploaded to Cloudinary through a signed, admin-only server route |
| No real order integrity | Server re-validates prices/stock and updates inventory inside a DB transaction |
| Anyone could "view" admin JS | All admin API routes and pages require a valid server session (checked in middleware **and** in every route/page) |

## 1. Prerequisites

- Node.js 18.18+
- A PostgreSQL database — [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) all have free tiers that work well with Vercel.
- A [Cloudinary](https://cloudinary.com) account (free tier is enough) for product image storage.
- A [Vercel](https://vercel.com) account for deployment (or any Node host that supports Next.js).

## 2. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — from your Postgres provider
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard

Push the schema and seed demo products:

```bash
npx prisma migrate dev --name init
npm run seed
```

Create your admin account (this is the **only** place credentials are set —
never in code, never in the frontend bundle):

```bash
npm run create-admin -- --username admin --password "a-long-unique-passphrase"
```

Run it:

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin panel.

## 3. How auth actually works

- `lib/auth.js` defines a NextAuth **Credentials** provider. On login, the
  submitted password is compared with `bcrypt.compare()` against the hash
  stored in the `AdminUser` table — the plaintext password is never stored
  anywhere, and the hash never reaches the browser.
- `middleware.js` blocks any request under `/admin/*` (except `/admin/login`)
  that doesn't carry a valid session JWT with `role: admin`.
- Every admin API route (`app/api/**/route.js`) independently re-checks
  `getServerSession()` before touching the database — so even if someone
  bypassed the middleware layer, the API itself still refuses unauthenticated
  writes.
- Sessions are JWT-based, 8-hour expiry, signed with `NEXTAUTH_SECRET`.
- A basic in-memory attempt counter throttles repeated failed logins per
  username. For a multi-instance/serverless deployment, swap this for a
  shared store (see "Hardening" below).

## 4. How images work

- The admin "Upload Image" button sends the file to `POST /api/upload`.
- That route checks the session server-side, validates file type/size, then
  uploads directly to Cloudinary using your **API secret**, which only ever
  lives in server environment variables — it's never sent to the browser.
- Cloudinary returns a permanent HTTPS URL, which is what gets stored on the
  product record and rendered on the storefront.
- Deleting or replacing a product's image also deletes the old Cloudinary
  asset, so storage doesn't leak.

## 5. How orders work

- Checkout posts to `POST /api/orders` with the cart contents — but the
  **server** looks up each product's real price and stock and recomputes the
  total itself; it never trusts a price sent from the browser.
- Stock decrements and order creation happen inside a single Prisma
  `$transaction`, so a partially-failed checkout can't leave stock
  inconsistent.
- Status changes (Pending → Confirmed → Shipped → Delivered → Cancelled) go
  through `PATCH /api/orders/[id]`, admin-only.

## 6. Deploying to Vercel with a custom domain

1. Push this project to a GitHub repository.
2. In Vercel: **New Project → Import** your repo.
3. Add the same environment variables from `.env` in **Project Settings →
   Environment Variables** (use your **production** database URL and set
   `NEXTAUTH_URL` to your real domain, e.g. `https://streetfashion.com`).
4. Deploy.
5. Run the schema migration against production once:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   ```
6. Create your production admin account the same way, pointed at production:
   ```bash
   DATABASE_URL="your-production-url" npm run create-admin -- --username admin --password "..."
   ```
7. (Optional) Seed demo products the same way with `npm run seed`, or just
   add your real catalog through the admin panel.
8. **Custom domain:** Project → **Settings → Domains → Add**, enter your
   domain, then add the DNS records Vercel shows you (usually an `A` record
   to `76.76.21.21` and a `CNAME` for `www`) at your domain registrar. Vercel
   provisions SSL automatically once DNS propagates.

## 7. Hardening for a real launch

These are reasonable next steps beyond what's included:

- **Rate limiting at the edge** — replace the in-memory login throttle with
  [Upstash Redis](https://upstash.com) + `@upstash/ratelimit`, or use
  Vercel's Web Application Firewall rules.
- **Email notifications** — hook `POST /api/orders` up to an email provider
  (Resend, Postmark) to notify the customer and store owner on new orders.
- **Payments** — this build treats checkout as "order request, paid on
  delivery / contacted after," matching the prototype's flow. Wiring in
  Stripe Checkout is a natural next step and slots into the existing
  `CheckoutModal` → `/api/orders` flow.
- **Audit logging** — log admin mutations (who changed what product/order,
  when) to a separate table for accountability.
- **Backups** — enable automatic backups on your Postgres provider.
- **2FA for admin** — NextAuth supports adding a TOTP step; worth it once
  more than one person has admin access.

## 8. Project structure

```
app/
  page.js                     storefront (server component, live DB data)
  admin/login/page.js          admin login (public)
  admin/(panel)/layout.js      session-gated shell for all admin pages
  admin/(panel)/dashboard/     stats
  admin/(panel)/products/      product CRUD
  admin/(panel)/orders/        order management
  admin/(panel)/settings/      store settings
  api/products/                public GET, admin POST
  api/products/[id]/           admin PATCH/DELETE
  api/upload/                  admin-only Cloudinary upload
  api/orders/                  public checkout (server-validated), admin GET
  api/orders/[id]/             admin status update
  api/settings/                public GET, admin PATCH
  api/auth/[...nextauth]/      NextAuth handler
components/
  ui.js                        shared Stamp/Toast/ConfirmDialog + helpers
  storefront/Storefront.js     full customer-facing UI
  admin/                       AdminShell, Products/Orders/SettingsClient
lib/
  prisma.js, auth.js, cloudinary.js, validators.js
prisma/
  schema.prisma, seed.js
scripts/
  create-admin.js               the only place admin credentials are set
middleware.js                   blocks unauthenticated /admin/* requests
```

## 9. A note on this build

I wasn't able to run `npm install` / `next build` in the sandbox that
generated this project (no network access there), so run a local build
before you deploy to catch anything a linter would've flagged:

```bash
npm install
npm run build
```
