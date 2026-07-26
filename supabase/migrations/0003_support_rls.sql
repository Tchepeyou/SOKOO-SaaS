-- RLS FOR SUPPORT TICKETS
alter table support_tickets enable row level security;

create policy "users can read tickets in their org"
on support_tickets for select
using (
  organization_id in (
    select organization_id from profiles where id = auth.uid()
  )
);

create policy "users can create tickets in their org"
on support_tickets for insert
with check (
  organization_id in (
    select organization_id from profiles where id = auth.uid()
  )
);

-- RLS FOR TICKET MESSAGES
alter table ticket_messages enable row level security;

create policy "users can read messages of their org tickets"
on ticket_messages for select
using (
  ticket_id in (
    select id from support_tickets where organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  )
);

create policy "users can add messages to their org tickets"
on ticket_messages for insert
with check (
  ticket_id in (
    select id from support_tickets where organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  )
);

-- TRIGGERS to update 'updated_at' on support_tickets
create or replace function update_ticket_timestamp()
returns trigger as $$
begin
  update support_tickets
  set updated_at = now()
  where id = NEW.ticket_id;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_ticket_timestamp on ticket_messages;
create trigger trigger_update_ticket_timestamp
after insert on ticket_messages
for each row execute function update_ticket_timestamp();
