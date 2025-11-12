-- Resource-specific pricing rules for time- and day-based overrides
-- This migration creates the `resource_pricing_rules` table and annotates
-- existing columns to document pricing semantics.

-- 1) Create table: resource_pricing_rules
create table if not exists public.resource_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.business_resources(id) on delete cascade,
  rule_name text not null,
  -- 1 = Monday, 7 = Sunday; when null, applies to all days
  day_of_week int[] null,
  start_time time not null,
  end_time time not null,
  price_override numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  -- Ensure day_of_week values are between 1 and 7 when provided
  constraint resource_pricing_rules_day_check
    check (
      day_of_week is null
      or day_of_week <@ ARRAY[1,2,3,4,5,6,7]
    )
);

comment on table public.resource_pricing_rules is 'Pricing overrides per resource and time window; applies on specified days and times.';
comment on column public.resource_pricing_rules.resource_id is 'FK to business_resources.id for the bookable asset (e.g., Field 1, Room A).';
comment on column public.resource_pricing_rules.rule_name is 'Label for this pricing tier (e.g., Peak Hour, Mid Night).';
comment on column public.resource_pricing_rules.day_of_week is 'Array of days the rule applies (1 = Mon ... 7 = Sun). Null means all days.';
comment on column public.resource_pricing_rules.start_time is 'Inclusive start time of the pricing window (e.g., 21:00:00).';
comment on column public.resource_pricing_rules.end_time is 'Exclusive end time of the pricing window (e.g., 05:00:00). May be earlier than start_time to indicate cross-midnight.';
comment on column public.resource_pricing_rules.price_override is 'Fixed price that overrides the default base price for matching slots.';

-- Useful indexes for lookups by resource and day
create index if not exists idx_resource_pricing_rules_resource
  on public.resource_pricing_rules (resource_id);

-- GIN index for day_of_week array membership queries
create index if not exists idx_resource_pricing_rules_dow
  on public.resource_pricing_rules using gin (day_of_week);

-- 2) Document existing pricing columns to reflect new logic
do $$
begin
  perform 1 from information_schema.columns
   where table_schema = 'public' and table_name = 'business_resources' and column_name = 'base_price';
  if found then
    execute 'comment on column public.business_resources.base_price is ''Default/fallback price applied when no resource_pricing_rules are active for a slot.''';
  end if;
end$$ language plpgsql;

do $$
begin
  perform 1 from information_schema.columns
   where table_schema = 'public' and table_name = 'slots' and column_name = 'slot_price';
  if found then
    execute 'comment on column public.slots.slot_price is ''Final calculated price for the slot after applying matching resource_pricing_rules, or the base price if none apply.''';
  end if;
end$$ language plpgsql;
