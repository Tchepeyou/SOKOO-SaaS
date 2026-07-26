-- Add location_id to support_tickets
alter table support_tickets add column location_id uuid references locations(id);
