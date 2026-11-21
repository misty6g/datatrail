# DataTrail

Mimo-style interactive lessons for **SQL**, **Tableau**, **Power BI**, **Python**, and **R**. Sign in to save progress on phone or laptop.

UX patterns were researched with [REA (Reverse Engineer Anything)](https://rea.tools/) against public Mimo pages; the product, copy, curriculum, and visuals are original.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Auth + Postgres (lesson progress with RLS)
- Framer Motion for light lesson transitions

## Local setup

1. `npm install`
2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3. Ensure the Supabase schema includes `profiles` and `lesson_progress` with RLS.
4. `npm run dev -- -p 3456`
5. Open http://localhost:3456

## Deploy on Vercel

Connect the GitHub repo, set the same `NEXT_PUBLIC_SUPABASE_*` env vars, and add the production URL under Supabase Auth → URL configuration.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
