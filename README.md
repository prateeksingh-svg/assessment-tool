# Sales Candidate Assessment Platform

A complete, free-to-deploy hiring platform for screening sales candidates.

## Features

- 55-question assessment (Intent, English, Sales, Personality, Aptitude)
- 20-minute countdown timer with auto-submit
- Cryptographically randomized question order per candidate
- Tab switch detection and tracking
- Auto-save every 30 seconds
- Live leaderboard with automated ranking (top 30% shortlisted, middle 40% under review, bottom 30% not selected)
- Individual scorecards with radar chart
- Excel export (color-coded, auto-filter)
- PDF/HTML report export
- Optional LLM review (OpenAI / Anthropic) — works when API key is added

---

## Tech Stack (100% Free)

| Layer | Service | Cost |
|-------|---------|------|
| Hosting | Vercel | Free |
| Database | Supabase (PostgreSQL) | Free |
| ORM | Prisma | Free |
| Auth | NextAuth.js | Free |
| Framework | Next.js 14 | Free |

---

## Deployment Guide (30 minutes)

### Step 1: Set Up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → Sign up → Create new project
2. Choose a name and a strong database password (save it!)
3. Select a region close to your users
4. Wait ~2 minutes for the project to be ready
5. Go to **Project Settings → Database → Connection string → URI mode**
6. Copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Set Up Vercel (Hosting)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Fork or push this project to your GitHub account
3. In Vercel → **Add New Project** → Import your GitHub repo
4. Before clicking Deploy, go to **Environment Variables** and add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Supabase connection string |
   | `NEXTAUTH_SECRET` | Any random 32+ character string (e.g. generate with `openssl rand -base64 32`) |
   | `NEXTAUTH_URL` | Your Vercel URL after deploy, e.g. `https://your-app.vercel.app` |
   | `ADMIN_USERNAME` | Your chosen admin username |
   | `ADMIN_PASSWORD` | Your chosen admin password |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

5. Click **Deploy**

### Step 3: Run Database Migration

After deployment is complete:

1. On your local machine, clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="Admin@123"
   ```

3. Push the database schema:
   ```bash
   npx prisma db push
   ```

4. Seed the admin user:
   ```bash
   npm run db:seed
   ```

### Step 4: Verify Deployment

1. Visit your Vercel URL → you should be redirected to `/admin/login`
2. Log in with your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Create a test assessment link
4. Visit `https://your-app.vercel.app/assess?token=[TOKEN]`
5. Complete a test submission

---

## Local Development

```bash
# Clone and install
npm install

# Set up .env (copy from .env.example)
cp .env.example .env
# Fill in your DATABASE_URL, etc.

# Push DB schema
npx prisma db push

# Seed admin user
npm run db:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

---

## Adding LLM Review (Optional)

The LLM review feature is built in but disabled until you add an API key.

### OpenAI
1. Get key at [platform.openai.com](https://platform.openai.com)
2. Add to Vercel Environment Variables: `OPENAI_API_KEY=sk-...`
3. Redeploy

### Anthropic
1. Get key at [console.anthropic.com](https://console.anthropic.com)
2. Add to Vercel Environment Variables: `ANTHROPIC_API_KEY=sk-ant-...`
3. Redeploy

Cost: ~₹1–2 per individual review, ~₹3–5 per batch review.

---

## How It Works

### Candidate Flow
1. Admin creates a link → shares `https://your-app.vercel.app/assess?token=...`
2. Candidate fills registration form (name, email, 10-digit mobile)
3. Assessment starts → 20-minute countdown begins immediately
4. Section 1 (7 mandatory questions) must be answered first → rest unlock automatically
5. Answers auto-save every 30 seconds
6. Tab switches are detected, tracked, and shown to admin
7. Assessment auto-submits at exactly 20 minutes
8. Candidate sees success screen; cannot re-attempt

### Scoring Formula
| Section | Raw Max | Weighted Max |
|---------|---------|--------------|
| Intent & Motivation | 21 pts (weighted) | 25 |
| English Communication | 12 correct | 25 |
| Sales Judgement | 12 correct | 20 |
| Personality & Resilience | 12 correct | 20 |
| Aptitude | 12 correct | 10 |
| **TOTAL** | | **100** |

### Ranking Logic
- Rankings recalculate after every submission
- Top 30% → **Shortlisted**
- Middle 40% → **Under Review**
- Bottom 30% → **Not Selected**
- Tied scores share the same rank

---

## Admin Dashboard

| Tab | Features |
|-----|---------|
| Link Management | Create links, copy URL, enable/disable, schedule batches |
| Live Leaderboard | All candidates ranked with scores, filters, search, LLM batch review |
| Individual Scorecard | Radar chart, section scores, AI review, behavioral flags |
| Reports & Exports | Excel (full leaderboard), PDF (printable report), Individual scorecard PDF |

---

## Security

- Admin dashboard protected by JWT sessions (NextAuth)
- Candidate sessions validated server-side
- Timer is server-anchored (cannot be manipulated client-side)
- Question order is cryptographically randomized per candidate
- Duplicate attempts blocked by email + linkId unique constraint
- Tab switch counter stored in database

---

## Capacity

This platform handles up to **500 candidates** comfortably on Supabase free tier:
- Supabase free: 50,000 rows, 500MB storage
- 500 candidates × ~60 rows each = ~30,000 rows (well within free tier)

---

## Troubleshooting

**"Prisma Client not found" error on Vercel:**
Add this to your `package.json` scripts:
```json
"postinstall": "prisma generate"
```

**Database connection errors:**
Make sure your `DATABASE_URL` doesn't have `?pgbouncer=true` for migrations. Use direct connection URL from Supabase.

**Admin login not working:**
Re-run `npm run db:seed` after setting environment variables.

**Candidates get "Link inactive" error:**
Make sure the link is set to Active in Link Management tab.
