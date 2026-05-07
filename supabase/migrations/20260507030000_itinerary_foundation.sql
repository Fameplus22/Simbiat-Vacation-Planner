-- Vacation Planner itinerary foundation.
-- Apply after 20260507020000_trip_editing_foundation.sql.

create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 365),
  city_name text not null check (char_length(trim(city_name)) between 1 and 120),
  title text not null default 'Open planning day' check (char_length(trim(title)) between 1 and 160),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_days_trip_day_unique unique (trip_id, day_number)
);

create index if not exists trip_days_user_id_idx on public.trip_days(user_id);
create index if not exists trip_days_trip_id_idx on public.trip_days(trip_id);
create index if not exists trip_days_trip_day_idx on public.trip_days(trip_id, day_number);

drop trigger if exists set_trip_days_updated_at on public.trip_days;
create trigger set_trip_days_updated_at
before update on public.trip_days
for each row execute function public.set_updated_at();

alter table public.trip_days enable row level security;

drop policy if exists "Users can view own trip days" on public.trip_days;
create policy "Users can view own trip days"
on public.trip_days
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_days.trip_id
      and trips.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert own trip days" on public.trip_days;
create policy "Users can insert own trip days"
on public.trip_days
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_days.trip_id
      and trips.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own trip days" on public.trip_days;
create policy "Users can update own trip days"
on public.trip_days
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_days.trip_id
      and trips.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_days.trip_id
      and trips.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own trip days" on public.trip_days;
create policy "Users can delete own trip days"
on public.trip_days
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.trips
    where trips.id = trip_days.trip_id
      and trips.user_id = (select auth.uid())
  )
);

create or replace function public.regenerate_trip_days(p_trip_id uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  trip_total_days integer;
  day_cursor integer := 1;
  city_day integer;
  city record;
  rows_prepared integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select total_days
  into trip_total_days
  from public.trips
  where id = p_trip_id
    and user_id = current_user_id;

  if trip_total_days is null then
    raise exception 'Trip not found';
  end if;

  delete from public.trip_days
  where trip_id = p_trip_id
    and user_id = current_user_id
    and day_number > trip_total_days;

  for city in
    select city_name, days_in_city
    from public.trip_cities
    where trip_id = p_trip_id
      and user_id = current_user_id
    order by sort_order asc, created_at asc
  loop
    for city_day in 1..city.days_in_city loop
      exit when day_cursor > trip_total_days;

      insert into public.trip_days (
        trip_id,
        user_id,
        day_number,
        city_name,
        title
      )
      values (
        p_trip_id,
        current_user_id,
        day_cursor,
        city.city_name,
        'Open planning day'
      )
      on conflict (trip_id, day_number) do update
      set city_name = excluded.city_name;

      rows_prepared := rows_prepared + 1;
      day_cursor := day_cursor + 1;
    end loop;
  end loop;

  while day_cursor <= trip_total_days loop
    insert into public.trip_days (
      trip_id,
      user_id,
      day_number,
      city_name,
      title
    )
    values (
      p_trip_id,
      current_user_id,
      day_cursor,
      'Unassigned',
      'Open planning day'
    )
    on conflict (trip_id, day_number) do update
    set city_name = excluded.city_name;

    rows_prepared := rows_prepared + 1;
    day_cursor := day_cursor + 1;
  end loop;

  return rows_prepared;
end;
$$;

grant select, insert, update, delete on public.trip_days to authenticated;
grant execute on function public.regenerate_trip_days(uuid) to authenticated;
