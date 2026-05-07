-- Vacation Planner Phase 1 foundation.
-- Apply this in Supabase before running live trip-save UAT.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_name text not null check (char_length(trim(country_name)) between 2 and 120),
  total_days integer not null check (total_days between 1 and 365),
  status text not null default 'draft' check (status in ('draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_cities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  city_name text not null check (char_length(trim(city_name)) between 1 and 120),
  days_in_city integer not null check (days_in_city between 1 and 365),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_id_idx on public.profiles(id);
create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trip_cities_user_id_idx on public.trip_cities(user_id);
create index if not exists trip_cities_trip_id_idx on public.trip_cities(trip_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

drop trigger if exists set_trip_cities_updated_at on public.trip_cities;
create trigger set_trip_cities_updated_at
before update on public.trip_cities
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_cities enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can view own trips" on public.trips;
create policy "Users can view own trips"
on public.trips
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own trips" on public.trips;
create policy "Users can insert own trips"
on public.trips
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own trips" on public.trips;
create policy "Users can update own trips"
on public.trips
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own trips" on public.trips;
create policy "Users can delete own trips"
on public.trips
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own trip cities" on public.trip_cities;
create policy "Users can view own trip cities"
on public.trip_cities
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_cities.trip_id
      and trips.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert own trip cities" on public.trip_cities;
create policy "Users can insert own trip cities"
on public.trip_cities
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_cities.trip_id
      and trips.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own trip cities" on public.trip_cities;
create policy "Users can update own trip cities"
on public.trip_cities
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_cities.trip_id
      and trips.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_cities.trip_id
      and trips.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own trip cities" on public.trip_cities;
create policy "Users can delete own trip cities"
on public.trip_cities
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_cities.trip_id
      and trips.user_id = (select auth.uid())
  )
);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.trips to authenticated;
grant select, insert, update, delete on public.trip_cities to authenticated;
