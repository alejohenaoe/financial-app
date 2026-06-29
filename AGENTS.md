# Project Context

Personal finance PWA for a single user. Fast transaction recording (<5s).

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Hook Form, Zod, React Router, Supabase (PostgreSQL), Lucide Icons, Recharts.

## Directory Structure

- `src/pages/` — Home (add form), History (list/search/edit/delete), Analytics (chart), AuthPage
- `src/components/` — Layout (tab bar), EditTransactionForm, shadcn/ui components
- `src/services/` — `transaction.ts` (CRUD, getBalance, getExpensesByCategory)
- `src/types/` — Transaction, InsertTransaction, Category, CATEGORIES const
- `src/lib/` — supabase client, utils (formatAmount, formatAmountInput, parseAmount)
- `src/hooks/` — useAuth (Supabase session), useInfiniteScroll

## Key Conventions

- Spanish UI: all user-facing strings in Spanish (UI, categories, validation, auth)
- Amounts: `.` thousand separator (es-ES locale), no decimals, stored in DB as number
- Amount input: `type="text" inputMode="numeric"` with live formatting via `formatAmountInput`
- Toggle colors: Expense active = `bg-expense text-white`, Income active = `bg-income text-white`
- Balance text: `text-5xl font-light` with smaller `$` sign
- Single table `transactions` with RLS per user
- User_id auto-set via DB trigger (auth.uid()), never from client
- Categories are stored as-is in DB, defined in `src/types/index.ts`
- All categories and transaction-related text is in Spanish

## Supabase

- **Project ref:** isnwtmzkikirsdrqqmqw
- **URL:** https://isnwtmzkikirsdrqqmqw.supabase.co
- **Migrations:** `supabase/migrations/`
- **Apply migrations:** `supabase db push` (requires SUPABASE_ACCESS_TOKEN)
- **Access token:** Stored in macOS keychain or provided by user — never hardcode in files
- **Dashboard:** https://supabase.com/dashboard/project/isnwtmzkikirsdrqqmqw

## Git & GitHub

- **Remote:** `git@github.com:alejohenaoe/financial-app.git` (SSH) — SSH key not configured
- **Push via HTTPS (when SSH fails):**
  ```bash
  git remote set-url origin https://alejohenaoe:TOKEN@github.com/alejohenaoe/financial-app.git
  git push origin main
  git remote set-url origin git@github.com:alejohenaoe/financial-app.git  # restore SSH
  ```
- **Token:** Provided by user when needed — never hardcode in files or commit
- **Token URL:** https://github.com/settings/tokens (needs `repo` scope)

## Running Locally

```bash
npm run dev     # Vite dev server
npm run build   # tsc + vite build
npm run preview # Preview production build
```

## Key Decisions

- No budgets, savings, multi-currency, recurring, bank sync, AI, OCR, CSV, admin panels
- iPhone-first, PWA installable, offline not required
- Color palette: background #F2F2F7, primary #007AFF, income #34C759, expense #FF3B30
- Transaction form is default landing page (speed priority)
- Balance = Total Income − Total Expenses (never stored)
