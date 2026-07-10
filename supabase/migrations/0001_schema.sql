-- SALES
create table sales (
  id uuid primary key default gen_random_uuid(),
  client_generated_id uuid unique,
  organization_id uuid references organizations(id) on delete cascade,
  location_id uuid references locations(id),
  subtotal numeric(12,2) not null,
  discount numeric(12,2) default 0,
  total numeric(12,2) not null,
  items jsonb not null default '[]'::jsonb, -- Store sale items as json array
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

alter table sales enable row level security;
create policy "org members can read sales"
on sales for select
using (organization_id = auth.user_organization_id());

create policy "employees create sales in their location"
on sales for insert with check (
  organization_id = auth.user_organization_id()
  and (
    auth.user_role() in ('owner', 'manager')
    or location_id = auth.user_location_id()
  )
);
