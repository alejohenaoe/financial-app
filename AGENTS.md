# Project Context

Personal finance PWA for a single user. Fast transaction recording (<5s).

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Hook Form, Zod, React Router, Supabase (PostgreSQL), Lucide Icons, Recharts.

## Directory Structure

- `src/pages/` — Home (add form), History (list/search/edit/delete), Analytics (chart), AuthPage
- `src/components/` — Layout (tab bar), EditTransactionForm, Toast, DatePicker, shadcn/ui components
- `src/services/` — `transaction.ts` (CRUD, getBalance, getExpensesByCategory)
- `src/types/` — Transaction, InsertTransaction, Category, CATEGORIES const
- `src/lib/` — supabase client, utils (formatAmount, formatAmountInput, parseAmount)
- `src/hooks/` — useAuth (Supabase session), useInfiniteScroll
- `public/` — sw.js (service worker), manifest.json, icons, favicon
- `supabase/migrations/` — DB migrations (001-005)
- `docs/` — AUDITORIA.md (plan de mejoras y resumen final)

## Key Conventions

- Spanish UI: all user-facing strings in Spanish (UI, categories, validation, auth)
- Amounts: `.` thousand separator (es-ES locale), no decimals, stored in DB as number
- Amount input: `type="text" inputMode="numeric"` with live formatting via `formatAmountInput`
- Toggle colors: Expense active = `bg-expense text-white`, Income active = `bg-income text-white`
- Balance text: `text-5xl font-light` with smaller `$` sign
- Balance hidden by default (`******`), tap the card to toggle. Auto-hides on `visibilitychange` (app background)
- `shouldFocusError: false` in `useForm` — prevents Android keyboard layout shift on validation errors
- `onPointerDown` blur in SelectTrigger (`select.tsx`) — closes keyboard before dropdown opens (fixes Android double-tap)
- Single table `transactions` with RLS per user
- User_id auto-set via DB trigger (auth.uid()), never from client
- Categories are stored as-is in DB, defined in `src/types/index.ts`
- All categories and transaction-related text is in Spanish
- Skeleton loading (`loadingSummary` state) on Home for balance card and recent transactions
- History: category and date filters hidden when typeFilter === "income"; switching to income resets both
- DatePicker: inline calendar, selects on day tap (no "Establecer" button), closes on selection or click outside

## Supabase

- **Project ref:** isnwtmzkikirsdrqqmqw
- **URL:** https://isnwtmzkikirsdrqqmqw.supabase.co
- **Migrations:** `supabase/migrations/`
- **Apply migrations:** `supabase db push` (requires SUPABASE_ACCESS_TOKEN)
- **Access token:** Stored in macOS keychain or provided by user — never hardcode in files
- **Dashboard:** https://supabase.com/dashboard/project/isnwtmzkikirsdrqqmqw
- **Token usage:** Stored in `.env` as `SUPABASE_ACCESS_TOKEN`. Load with `. env` before running `supabase db push` to apply migrations.

## Git & GitHub

- **Nunca ejecutar comandos git sin que el usuario lo pida explícitamente.**
- **Los mensajes de commit deben ser descriptivos** — explicar qué y por qué cambia, no solo "fix bug" o "update".
- **Remote:** `git@github.com:alejohenaoe/financial-app.git` (SSH) — SSH key not configured
- **Push via HTTPS (when SSH fails):**
  ```bash
  git remote set-url origin https://alejohenaoe:$GITHUB_TOKEN@github.com/alejohenaoe/financial-app.git
  git push origin main
  git remote set-url origin git@github.com:alejohenaoe/financial-app.git  # restore SSH
  ```
- **Token:** Stored in `.env` as `GITHUB_TOKEN` (loaded by shell when running commands)
- **Token URL:** https://github.com/settings/tokens (needs `repo` scope)
- **Usage:** `. env` to load, then run the push commands above (the token is interpolated via `$GITHUB_TOKEN`)

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
- Layout: `h-dvh` + `overflow-y-auto` on container, not `min-h-screen` (consistent sticky nav, no horizontal scroll)
- Service worker: network-first navigate, cache `/index.html` fallback for Android PWA refresh 404
- `vercel.json`: SPA rewrite all routes to `/index.html`
- **Deploy:** Automático al hacer push a `main` en GitHub. No instalar Vercel CLI ni ejecutar `vercel deploy`.
- getBalance() uses `select("type, amount")` + filter/reduce in JS (not aggregate query — tried and reverted, see `docs/AUDITORIA.md`)
