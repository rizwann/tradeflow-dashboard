begin;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text,
  city text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sales
add column if not exists customer_id uuid references customers(id);

create table if not exists sales_deliveries (
  id uuid primary key default gen_random_uuid(),

  sale_id uuid not null references sales(id) on delete cascade,
  customer_id uuid references customers(id),

  status text not null default 'pending'
    check (status in ('pending', 'shipped', 'delivered', 'cancelled')),

  delivery_method text,
  tracking_number text,

  delivery_cost numeric(12,2) not null default 0,
  delivery_cost_paid_by text not null default 'business'
    check (delivery_cost_paid_by in ('business', 'customer')),

  shipped_at timestamptz,
  delivered_at timestamptz,

  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_phone_idx
on customers(phone);

create index if not exists customers_created_by_idx
on customers(created_by);

create index if not exists sales_customer_id_idx
on sales(customer_id);

create index if not exists sales_deliveries_sale_id_idx
on sales_deliveries(sale_id);

create index if not exists sales_deliveries_customer_id_idx
on sales_deliveries(customer_id);

create index if not exists sales_deliveries_status_idx
on sales_deliveries(status);

alter table customers enable row level security;
alter table sales_deliveries enable row level security;

drop policy if exists "Authenticated users can read customers" on customers;
drop policy if exists "Authenticated users can create customers" on customers;
drop policy if exists "Admins can update all customers" on customers;
drop policy if exists "Partners can update own customers" on customers;

create policy "Authenticated users can read customers"
on customers for select
to authenticated
using (true);

create policy "Authenticated users can create customers"
on customers for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Admins can update all customers"
on customers for update
to authenticated
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');

create policy "Partners can update own customers"
on customers for update
to authenticated
using (
  public.get_current_user_role() = 'partner'
  and created_by = auth.uid()
)
with check (
  public.get_current_user_role() = 'partner'
  and created_by = auth.uid()
);

drop policy if exists "Authenticated users can read deliveries" on sales_deliveries;
drop policy if exists "Authenticated users can create deliveries" on sales_deliveries;
drop policy if exists "Admins can update all deliveries" on sales_deliveries;
drop policy if exists "Partners can update own deliveries" on sales_deliveries;

create policy "Authenticated users can read deliveries"
on sales_deliveries for select
to authenticated
using (true);

create policy "Authenticated users can create deliveries"
on sales_deliveries for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Admins can update all deliveries"
on sales_deliveries for update
to authenticated
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');

create policy "Partners can update own deliveries"
on sales_deliveries for update
to authenticated
using (
  public.get_current_user_role() = 'partner'
  and created_by = auth.uid()
)
with check (
  public.get_current_user_role() = 'partner'
  and created_by = auth.uid()
);

commit;