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
  cta_label text not null default '',
  cta_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.products
  add column if not exists published_at date,
  add column if not exists screenshots jsonb not null default '[]'::jsonb;

alter table if exists public.products
  alter column cta_label set default '',
  alter column cta_url set default '';

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

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;
