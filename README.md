# Trading Journal

Gold (XAU/USD) trading journal — React, Tailwind, Supabase auth, deployable on Vercel.

## Features

- Dashboard, Entry Trade, Daily / Weekly / Monthly reports, Strategy playbook
- Login & signup (Supabase Auth, free tier)
- **User approval** — new users sign up freely; superadmin approves access
- Roles: **user** and **superadmin** (two fixed superadmin emails)
- Light minimal UI, strategy filters, calendar stars, trade cards

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4, React Router, Framer Motion
- Supabase (Auth + Postgres)
- Vercel (hosting)

---

## 1. Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

Without `.env`, the app runs in **demo mode** (no login required).

---

## 2. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free tier).
2. Create a new project (pick a region close to you).
3. Wait for the database to finish provisioning.
4. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
5. Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

6. Open **SQL Editor** in Supabase:
   - **New project:** run `supabase/schema.sql`
   - **Already ran old schema:** run `supabase/migration_user_approval.sql`
   - **Auth / user management not working:** run `supabase/fix_auth_rls.sql` ← **run this if superadmin or Manage Users fails**

7. **Authentication → Providers → Email** — leave Email enabled (default).

8. **Optional:** disable “Confirm email” under Auth settings for instant login (testing).

9. **Superadmin accounts** (auto-approved on signup):
   - `waqasdostdost0092@gmail.com`
   - `waqaskhan.dost0092@gmail.com`

   If you signed up before running the migration, run:

```sql
update public.profiles
set role = 'superadmin', status = 'approved'
where lower(email) in (
  'waqasdostdost0092@gmail.com',
  'waqaskhan.dost0092@gmail.com'
);
```

Regular users sign up → status `pending` → superadmin approves in **Manage Users**.

Restart dev server after adding `.env`:

```bash
npm run dev
```

---

## 3. Push to GitHub

```bash
git add .
git commit -m "Add Supabase auth and Vercel config"
git push origin main
```

Repo: [github.com/dost0092/trading-journal](https://github.com/dost0092/trading-journal)

---

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New → Project** → import `dost0092/trading-journal`.
3. Framework preset: **Vite** (auto-detected).
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment Variables** — add the same two keys:

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon key |

5. Click **Deploy**.

6. After deploy, in Supabase go to **Authentication → URL Configuration** and add your Vercel URL:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`

7. Visit your Vercel URL → **Sign up** → sign in.

`vercel.json` already includes SPA rewrites so React Router works on refresh.

---

## Build

```bash
npm run build
npm run preview
```

---

## Roles & access

| Role | Access |
|------|--------|
| **user (pending)** | Can sign up / sign in; sees “Waiting for approval” |
| **user (approved)** | Full journal access |
| **user (rejected)** | Sign in blocked with “Access denied” |
| **superadmin** | Full access + **Manage Users** to approve/reject |

Superadmins: `waqasdostdost0092@gmail.com`, `waqaskhan.dost0092@gmail.com`

---

## Next steps (optional)

- Sync `TradeContext` mock data to the `trades` table in Supabase
- Upload trade images to Supabase Storage
- Add an admin page for superadmin user list
