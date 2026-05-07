-- Vacation Planner itinerary day editing.
-- Apply after 20260507030000_itinerary_foundation.sql.

create or replace function public.update_trip_day_details(
  p_trip_id uuid,
  p_day_ids uuid[],
  p_titles text[],
  p_notes text[]
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  day_count integer;
  day_index integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  day_count := coalesce(array_length(p_day_ids, 1), 0);

  if day_count = 0 then
    raise exception 'At least one itinerary day is required';
  end if;

  if day_count != coalesce(array_length(p_titles, 1), 0)
    or day_count != coalesce(array_length(p_notes, 1), 0) then
    raise exception 'Itinerary day arrays must have the same length';
  end if;

  if not exists (
    select 1
    from public.trips
    where id = p_trip_id
      and user_id = current_user_id
  ) then
    raise exception 'Trip not found';
  end if;

  for day_index in 1..day_count loop
    update public.trip_days
    set
      title = p_titles[day_index],
      notes = nullif(p_notes[day_index], '')
    where id = p_day_ids[day_index]
      and trip_id = p_trip_id
      and user_id = current_user_id;

    if not found then
      raise exception 'Itinerary day not found';
    end if;
  end loop;

  return day_count;
end;
$$;

grant execute on function public.update_trip_day_details(
  uuid,
  uuid[],
  text[],
  text[]
) to authenticated;
