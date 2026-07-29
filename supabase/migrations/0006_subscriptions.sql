create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  plan text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled')),
  current_period_end timestamp with time zone not null,
  fedapay_transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for subscriptions
alter table public.subscriptions enable row level security;

create policy "Organizations can view their own subscriptions"
  on public.subscriptions for select
  using (organization_id = auth.user_organization_id());

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.platform_admins where id = auth.uid()
    )
  );

-- Trigger to update updated_at
create trigger handle_updated_at_subscriptions
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();
