-- Vacation Planner trip editing foundation.
-- Apply after 20260507010000_global_planning_foundation.sql.

create or replace function public.update_trip_draft(
  p_trip_id uuid,
  p_country_name text,
  p_total_days integer,
  p_starts_on date,
  p_ends_on date,
  p_traveler_count integer,
  p_budget_amount numeric,
  p_currency_code text,
  p_planning_locale text,
  p_notes text,
  p_city_names text[],
  p_days_in_city integer[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  city_index integer;
  city_count integer;
  allocated_days integer;
begin
  city_count := coalesce(array_length(p_city_names, 1), 0);

  if city_count = 0 then
    raise exception 'At least one city is required';
  end if;

  if city_count != coalesce(array_length(p_days_in_city, 1), 0) then
    raise exception 'City names and city day arrays must have the same length';
  end if;

  select coalesce(sum(days), 0)
  into allocated_days
  from unnest(p_days_in_city) as city_days(days);

  if allocated_days != p_total_days then
    raise exception 'City day allocation must equal total trip days';
  end if;

  if not exists (
    select 1
    from public.trips
    where id = p_trip_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'Trip not found';
  end if;

  update public.trips
  set
    country_name = p_country_name,
    total_days = p_total_days,
    starts_on = p_starts_on,
    ends_on = p_ends_on,
    traveler_count = p_traveler_count,
    budget_amount = p_budget_amount,
    currency_code = p_currency_code,
    planning_locale = p_planning_locale,
    notes = p_notes
  where id = p_trip_id
    and user_id = (select auth.uid());

  delete from public.trip_cities
  where trip_id = p_trip_id
    and user_id = (select auth.uid());

  for city_index in 1..city_count loop
    insert into public.trip_cities (
      trip_id,
      user_id,
      city_name,
      days_in_city,
      sort_order
    )
    values (
      p_trip_id,
      (select auth.uid()),
      p_city_names[city_index],
      p_days_in_city[city_index],
      city_index - 1
    );
  end loop;

  return p_trip_id;
end;
$$;

grant execute on function public.update_trip_draft(
  uuid,
  text,
  integer,
  date,
  date,
  integer,
  numeric,
  text,
  text,
  text,
  text[],
  integer[]
) to authenticated;
