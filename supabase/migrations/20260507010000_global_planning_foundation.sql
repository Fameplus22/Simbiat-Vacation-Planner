-- Vacation Planner global planning foundation.
-- Apply after 20260507000000_bootstrap_foundation.sql.

alter table public.profiles
add column if not exists preferred_locale text not null default 'en',
add column if not exists preferred_currency text not null default 'USD';

alter table public.trips
add column if not exists starts_on date,
add column if not exists ends_on date,
add column if not exists traveler_count integer not null default 1,
add column if not exists budget_amount numeric(12, 2),
add column if not exists currency_code text not null default 'USD',
add column if not exists planning_locale text not null default 'en',
add column if not exists notes text;

alter table public.profiles
drop constraint if exists profiles_preferred_locale_check,
add constraint profiles_preferred_locale_check
check (preferred_locale in ('en', 'es', 'fr', 'pt', 'ar', 'zh'));

alter table public.profiles
drop constraint if exists profiles_preferred_currency_check,
add constraint profiles_preferred_currency_check
check (preferred_currency in ('USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'AED', 'ZAR', 'BRL', 'INR', 'MXN'));

alter table public.trips
drop constraint if exists trips_traveler_count_check,
add constraint trips_traveler_count_check
check (traveler_count between 1 and 99);

alter table public.trips
drop constraint if exists trips_budget_amount_check,
add constraint trips_budget_amount_check
check (budget_amount is null or budget_amount >= 0);

alter table public.trips
drop constraint if exists trips_currency_code_check,
add constraint trips_currency_code_check
check (currency_code in ('USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'AED', 'ZAR', 'BRL', 'INR', 'MXN'));

alter table public.trips
drop constraint if exists trips_planning_locale_check,
add constraint trips_planning_locale_check
check (planning_locale in ('en', 'es', 'fr', 'pt', 'ar', 'zh'));

alter table public.trips
drop constraint if exists trips_date_range_check,
add constraint trips_date_range_check
check (starts_on is null or ends_on is null or ends_on >= starts_on);
