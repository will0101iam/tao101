create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  published_at date,
  cover_image_url text not null default '',
  content_html text not null default '<p></p>',
  blocks_json jsonb not null default '[]'::jsonb,
  source_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_name text not null default 'Guotao Tao',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  published_at date,
  cover_image_url text not null default '',
  screenshots jsonb not null default '[]'::jsonb,
  content_html text not null default '<p></p>',
  blocks_json jsonb not null default '[]'::jsonb,
  cta_label text not null default '',
  cta_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.posts enable row level security;
alter table public.products enable row level security;

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
using (status = 'published');

drop policy if exists "Authenticated users manage posts" on public.posts;
create policy "Authenticated users manage posts"
on public.posts
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products
for select
using (status = 'published');

drop policy if exists "Authenticated users manage products" on public.products;
create policy "Authenticated users manage products"
on public.products
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
on storage.objects
for select
using (bucket_id = 'media');

drop policy if exists "Authenticated users upload media" on storage.objects;
create policy "Authenticated users upload media"
on storage.objects
for insert
with check (
  bucket_id = 'media'
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated users update media" on storage.objects;
create policy "Authenticated users update media"
on storage.objects
for update
using (
  bucket_id = 'media'
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'media'
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated users delete media" on storage.objects;
create policy "Authenticated users delete media"
on storage.objects
for delete
using (
  bucket_id = 'media'
  and auth.role() = 'authenticated'
);
