-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ORGANISATIONS (le tenant)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'trial',
  subscription_status text not null default 'trialing',
  trial_ends_at timestamptz default (now() + interval '21 days'),
  created_at timestamptz default now()
);

-- POINTS DE VENTE / ENTREPÔTS
create table locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- PROFILS UTILISATEURS
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  full_name text,
  phone text unique,
  role text not null default 'employee', -- 'owner' | 'manager' | 'employee'
  location_id uuid references locations(id),
  created_at timestamptz default now()
);

-- PRODUITS
create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  location_id uuid references locations(id),
  name text not null,
  sku text,
  unit_price numeric(12,2),
  alert_threshold integer not null default 5,
  category text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MOUVEMENTS DE STOCK (ledger, table centrale)
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  client_generated_id uuid unique, -- clé d'idempotence pour la sync offline
  organization_id uuid references organizations(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  type text not null check (type in ('in', 'out', 'adjustment')),
  quantity integer not null,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

-- ALERTES
create table alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  type text not null default 'low_stock',
  status text not null default 'open',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- INVITATIONS D'ÉQUIPE
create table invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  phone text not null,
  role text not null default 'employee',
  token text unique not null,
  expires_at timestamptz default (now() + interval '7 days'),
  accepted_at timestamptz
);

-- ABONNEMENTS
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  plan text not null,
  status text not null,
  mobile_money_reference text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- VUE DE STOCK CALCULÉ (jamais de champ quantity écrit directement)
create view current_stock as
select
  p.id as product_id,
  p.organization_id,
  p.name,
  coalesce(sum(case when m.type = 'in' then m.quantity
                     when m.type = 'adjustment' then m.quantity
                     else -m.quantity end), 0) as quantity_on_hand
from products p
left join stock_movements m on m.product_id = p.id
group by p.id, p.organization_id, p.name;


-- ROW LEVEL SECURITY (RLS)

-- Fonctions de sécurité pour simplifier les politiques
create or replace function auth.user_organization_id()
returns uuid language sql stable as $$
  select organization_id from profiles where id = auth.uid()
$$;

create or replace function auth.user_role()
returns text language sql stable as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function auth.user_location_id()
returns uuid language sql stable as $$
  select location_id from profiles where id = auth.uid()
$$;


-- ORGANIZATIONS
alter table organizations enable row level security;
create policy "org members can read their organization"
on organizations for select
using (id = auth.user_organization_id());


-- LOCATIONS
alter table locations enable row level security;
create policy "org members can read locations"
on locations for select
using (organization_id = auth.user_organization_id());


-- PROFILES
alter table profiles enable row level security;
create policy "org members can read profiles"
on profiles for select
using (organization_id = auth.user_organization_id());

create policy "users can update their own profile"
on profiles for update
using (id = auth.uid());


-- PRODUCTS
alter table products enable row level security;
create policy "org members can read products"
on products for select
using (organization_id = auth.user_organization_id());

create policy "owner and manager can write products"
on products for all using (
  organization_id = auth.user_organization_id()
  and auth.user_role() in ('owner', 'manager')
);


-- STOCK MOVEMENTS
alter table stock_movements enable row level security;
create policy "org members can read movements"
on stock_movements for select
using (organization_id = auth.user_organization_id());

create policy "employees create movements in their location"
on stock_movements for insert with check (
  organization_id = auth.user_organization_id()
  and (
    auth.user_role() in ('owner', 'manager')
    or product_id in (
      select id from products
      where location_id = auth.user_location_id()
    )
  )
);


-- ALERTS
alter table alerts enable row level security;
create policy "org members can read alerts"
on alerts for select
using (organization_id = auth.user_organization_id());

create policy "org members can update alerts"
on alerts for update using (
  organization_id = auth.user_organization_id()
);


-- INVITES
alter table invites enable row level security;
create policy "owner and manager can manage invites"
on invites for all using (
  organization_id = auth.user_organization_id()
  and auth.user_role() in ('owner', 'manager')
);


-- SUBSCRIPTIONS
alter table subscriptions enable row level security;
create policy "owner can read subscriptions"
on subscriptions for select using (
  organization_id = auth.user_organization_id()
  and auth.user_role() = 'owner'
);
