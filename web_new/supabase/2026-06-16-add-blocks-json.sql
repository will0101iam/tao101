alter table public.posts
add column if not exists blocks_json jsonb not null default '[]'::jsonb;

alter table public.products
add column if not exists blocks_json jsonb not null default '[]'::jsonb;
