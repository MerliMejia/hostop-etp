create extension if not exists "pgcrypto";

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  nickname text not null,
  city text not null,
  bedrooms integer not null check (bedrooms > 0),
  base_nightly_rate numeric(10, 2) not null check (base_nightly_rate >= 0)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  pms_reservation_id text not null,
  guest_name text not null,
  check_in date not null,
  check_out date not null,
  total_revenue numeric(12, 2) not null check (total_revenue >= 0),
  status text not null check (status in ('confirmed', 'cancelled', 'completed')),
  channel text not null,
  created_at timestamptz not null default now(),
  constraint reservations_valid_stay check (check_out > check_in),
  constraint reservations_org_pms_unique unique (org_id, pms_reservation_id)
);

create index users_org_id_idx on public.users(org_id);
create index units_org_id_idx on public.units(org_id);
create index reservations_org_created_at_idx on public.reservations(org_id, created_at desc);
create index reservations_org_unit_idx on public.reservations(org_id, unit_id);
create index reservations_org_status_idx on public.reservations(org_id, status);

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.units enable row level security;
alter table public.reservations enable row level security;

create or replace function public.current_user_org_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select org_id from public.users where id = auth.uid()
$$;

create policy "Users can read their organization"
on public.organizations
for select
to authenticated
using (id = public.current_user_org_id());

create policy "Users can read their profile"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "Users can update their profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and org_id = public.current_user_org_id());

create policy "Org members can read units"
on public.units
for select
to authenticated
using (org_id = public.current_user_org_id());

create policy "Org members can insert units"
on public.units
for insert
to authenticated
with check (org_id = public.current_user_org_id());

create policy "Org members can update units"
on public.units
for update
to authenticated
using (org_id = public.current_user_org_id())
with check (org_id = public.current_user_org_id());

create policy "Org members can delete units"
on public.units
for delete
to authenticated
using (org_id = public.current_user_org_id());

create policy "Org members can read reservations"
on public.reservations
for select
to authenticated
using (org_id = public.current_user_org_id());

create policy "Org members can insert reservations"
on public.reservations
for insert
to authenticated
with check (
  org_id = public.current_user_org_id()
  and exists (
    select 1
    from public.units
    where units.id = reservations.unit_id
      and units.org_id = reservations.org_id
  )
);

create policy "Org members can update reservations"
on public.reservations
for update
to authenticated
using (org_id = public.current_user_org_id())
with check (
  org_id = public.current_user_org_id()
  and exists (
    select 1
    from public.units
    where units.id = reservations.unit_id
      and units.org_id = reservations.org_id
  )
);

create policy "Org members can delete reservations"
on public.reservations
for delete
to authenticated
using (org_id = public.current_user_org_id());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
begin
  org_name := coalesce(
    new.raw_user_meta_data ->> 'organization_name',
    split_part(new.email, '@', 1) || '''s organization'
  );

  insert into public.organizations (name)
  values (org_name)
  returning id into new_org_id;

  insert into public.users (id, org_id, email)
  values (new.id, new_org_id, new.email);

  insert into public.units (org_id, nickname, city, bedrooms, base_nightly_rate)
  values
    (new_org_id, 'Oceanview Studio', 'Miami', 1, 155.00),
    (new_org_id, 'Downtown Loft', 'Austin', 2, 225.00),
    (new_org_id, 'Garden Villa', 'Scottsdale', 3, 310.00);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
