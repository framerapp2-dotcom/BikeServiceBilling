# OMR'S GREAT SERVICE POINT — Bike Service Billing & Management

Modern web app for bike service shops: invoices, customers, inventory, expenses, salaries, reports, print/PDF/WhatsApp sharing.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **Poppins**
- **Supabase** (PostgreSQL, Auth, RLS)
- **Recharts**, **Lucide**, **jsPDF**

## Quick start (localhost)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **SQL Editor**, run the full script from `supabase/migrations/001_initial_schema.sql`.

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3010
NEXT_PUBLIC_DEFAULT_SHOP_NAME=OMR'S GREAT SERVICE POINT
```

Find URL and keys in Supabase → **Project Settings → API**.

### 3. Install and seed

```bash
npm install
npm run db:seed
```

Default login after seed:

- **Login ID:** `Admin`
- **Password:** `Admin@12345`

The login ID maps to `thegreatservicepoint@gmail.com` in Supabase Auth. You can also type that email on the login screen.

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

## Shop name

- Editable in **Settings → Shop Profile** (used on all invoices).
- Optional default at build time: `NEXT_PUBLIC_DEFAULT_SHOP_NAME` in `.env.local`.

## Features

| Module | Description |
|--------|-------------|
| Dashboard | Revenue, expenses, salaries, charts from live data |
| Invoices | Create, list, preview, print, PDF, WhatsApp deep link |
| Customers | Profiles, bikes, visit history |
| Inventory | Stock levels, low/out alerts, adjust quantity |
| Services | Catalog for fast invoice lines |
| Expenses | Categories and monthly totals |
| Employees | Salaries per month |
| Reports | Profit, CSV export, print |

## Production notes

- Enable email auth in Supabase and configure site URL / redirect URLs for your domain.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser.
- Forgot password: wire Supabase reset email in Auth settings (UI placeholder on login page).

## License

Private / client project.
