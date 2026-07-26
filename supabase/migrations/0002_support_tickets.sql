-- SUPPORT TICKETS
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number serial,
  organization_id uuid references organizations(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  subject text not null,
  status text not null default 'Nouveau' check (status in ('Nouveau', 'En cours', 'Résolu', 'Fermé')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TICKET MESSAGES
create table if not exists ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references support_tickets(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade, -- null if sent by platform admin
  is_admin boolean default false not null,
  message text not null,
  created_at timestamptz default now()
);
