# Buy Your Kids A House — App

The companion app to the Buy Your Kids A House podcast. Phase 1 = auth + empty dashboard. Subsequent phases add the Forever Fund, Budget Tracker, Investment Tracker, Kids House Fund, and Plaid bank sync.

## Stack

- **Next.js 15** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** (brand colors: navy + gold)
- **Supabase** (PostgreSQL + Auth)
- **Vercel** (hosting + auto-deploy from GitHub)

## Phase 1 — What This Ships

- ✅ Marketing landing page at `/`
- ✅ Sign-up flow (email + password, email verification)
- ✅ Sign-in / sign-out
- ✅ Forgot password + reset password flows
- ✅ Protected `/dashboard` route
- ✅ Brand-consistent UI

No business logic yet. That comes in Phase 2 (Forever Fund module).

## Setup (one-time)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your actual values:

- `NEXT_PUBLIC_SUPABASE_URL` — from your Supabase project (Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same place
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for dev

### 3. Configure Supabase Auth URLs

In your Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (for dev) — change to your Vercel URL once deployed.
- **Redirect URLs** (add all of these):
  - `http://localhost:3000/auth/callback`
  - `https://bykah-app.vercel.app/auth/callback` (your Vercel preview URL)
  - `https://app.buyyourkidsahouse.com/auth/callback` (production, once domain configured)

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Deploy

Push to the `main` branch of the `bykah-app` GitHub repo. Vercel auto-deploys.

In Vercel, add the same env vars (Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` — `https://bykah-app.vercel.app` (or your custom domain)

## Project Structure

```
bykah-app/
├── middleware.ts                    # Next.js middleware — protects routes
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── lib/supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   ├── server.ts                # Server Supabase client (cookies)
│   │   └── middleware.ts            # Session refresh + route guards
│   └── app/
│       ├── layout.tsx               # Root layout
│       ├── page.tsx                 # / — landing
│       ├── globals.css              # Tailwind + brand styling
│       ├── (auth)/                  # Public auth pages (no auth required)
│       │   ├── login/page.tsx
│       │   ├── signup/page.tsx
│       │   ├── forgot-password/page.tsx
│       │   └── reset-password/page.tsx
│       ├── (app)/                   # Protected pages (auth required)
│       │   ├── layout.tsx           # Header + sign-out + footer
│       │   └── dashboard/page.tsx
│       └── auth/
│           ├── callback/route.ts    # Supabase callback handler
│           └── signout/route.ts     # POST to sign out
```

## Testing the Auth Flow

1. Go to `/signup` → enter name, email, password → submit
2. Check your inbox for the Supabase confirmation email → click the link
3. You should land on `/dashboard` with your account logged in
4. Click "Sign out" → you're back at `/`
5. Try `/login` with the same credentials → back at `/dashboard`
6. Try `/forgot-password` → check email for reset link → set new password

## Troubleshooting

- **Email never arrives:** Check Supabase Authentication → Email Templates → make sure it's enabled. Free-tier Supabase uses a shared SMTP that sometimes goes to spam. For production, configure custom SMTP via Postmark/SendGrid (Phase 3 task).
- **"Auth callback failed" error:** Make sure your Redirect URLs in Supabase include the exact URL the email link points to.
- **Vercel build fails:** Make sure env vars are set in Vercel's Environment Variables (not just `.env.local`).

## Next: Phase 2

The Forever Fund module. We'll build:
- Add Expense form (monthly cost, category, label)
- Portfolio input (current invested amount + monthly contribution)
- Forever Number calculation engine
- Per-expense progress dashboard
- "What if I invested $X more?" projection slider
