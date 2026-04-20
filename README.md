# Vernacular FD Advisor (MVP)

AI-powered personal finance assistant for Indian users in **Hindi, Marathi, and Tamil**.

## What this MVP includes

- Multilingual onboarding, dashboard, and chat UX
- Email/password auth with Supabase
- Budget setup by category
- Expense logging + category breakdown chart
- AI financial guidance using Gemini (via AI SDK + OpenAI-compatible endpoint)
- User profile context in advisory responses

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase (Auth + Postgres + RLS)
- Recharts
- Vercel AI SDK + Gemini

## Quick start

1. Install dependencies

```bash
pnpm install
```

2. Create local env file

```bash
pnpm setup:env
```

3. Fill `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

4. Initialize DB schema in Supabase SQL editor

```sql
-- Run file:
scripts/setup-db.sql
```

5. Run app

```bash
pnpm dev
```

## Scripts

- `pnpm dev` - run development server
- `pnpm build` - production build
- `pnpm start` - run production server
- `pnpm lint` - eslint
- `pnpm typecheck` - TypeScript type checks

## Project structure

```text
app/
  api/chat/route.ts      # AI chat endpoint
  page.tsx               # Landing page
  login/page.tsx
  signup/page.tsx
  dashboard/page.tsx
  chat/page.tsx

components/
  BudgetTracker.tsx
  ExpenseTracker.tsx

lib/
  auth.ts
  language-context.tsx
  translations.ts

scripts/
  setup-db.sql
```

## MVP push checklist

Before pushing to GitHub:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Ensure `.env.local` is not committed (already covered by `.gitignore`).
