# Trading Journal

Gold (XAU/USD) trading journal — React, Tailwind, Supabase auth, deployable on Vercel.

## Features

- Dashboard, Entry Trade, Daily / Weekly / Monthly reports, Strategy playbook
- Login & signup (Supabase Auth, free tier)
- Roles: **user** and **superadmin**
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

6. Open **SQL Editor** in Supabase and run the full script in:

   `supabase/schema.sql`

   This creates `profiles` (with roles), `trades` table, RLS policies, and auto-profile on signup.

7. **Authentication → Providers → Email** — leave Email enabled (default).

8. **Optional:** disable “Confirm email” under Auth settings if you want instant login without email confirmation (dev only).

9. **Sign up** once in the app, then in SQL Editor make yourself superadmin:

```sql
update public.profiles
set role = 'superadmin'
where email = 'your@email.com';
```

Regular users get `role = 'user'` automatically on signup.

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

## Roles

| Role | Access |
|------|--------|
| **user** | Own profile and trades (when synced to DB) |
| **superadmin** | Can read all profiles and trades (RLS in schema) |

Superadmin is set manually in Supabase SQL after first signup.

---

## Next steps (optional)

- Sync `TradeContext` mock data to the `trades` table in Supabase
- Upload trade images to Supabase Storage
- Add an admin page for superadmin user list
