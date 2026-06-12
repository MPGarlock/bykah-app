-- Add support for "Fixed Bill" vs "Bucket" budget category items.
alter table public.budget_categories
  add column if not exists item_type text not null default 'bucket',
  add column if not exists due_day smallint;

alter table public.budget_categories
  add constraint budget_categories_item_type_check
  check (item_type in ('bucket', 'fixed_bill'));

alter table public.budget_categories
  add constraint budget_categories_due_day_check
  check (due_day is null or (due_day >= 1 and due_day <= 31));
