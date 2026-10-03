alter table public.invoices add column if not exists share_code text;

create unique index if not exists invoices_share_code_key
  on public.invoices (share_code)
  where share_code is not null;
