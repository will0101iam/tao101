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

create table if not exists public.site_settings (
  id text primary key default 'default',
  hero_eyebrow text not null default '',
  hero_title text not null default '',
  hero_description text not null default '',
  hero_primary_cta_label text not null default '',
  hero_primary_cta_url text not null default '',
  hero_secondary_cta_label text not null default '',
  hero_secondary_cta_url text not null default '',
  products_eyebrow text not null default '',
  products_title text not null default '',
  products_description text not null default '',
  products_card_cta_label text not null default 'Explore Tool',
  products_empty_state text not null default 'No published products yet.',
  blog_eyebrow text not null default '',
  blog_title text not null default '',
  blog_description text not null default '',
  blog_load_more_label text not null default 'Load More',
  blog_card_cta_label text not null default 'Read Full Post',
  blog_empty_state text not null default 'No published posts yet.',
  post_loading_label text not null default 'Loading post...',
  post_not_found_title text not null default 'Post not found',
  return_home_label text not null default 'Return to home',
  product_loading_label text not null default 'Loading product...',
  product_not_found_title text not null default 'Product not found',
  product_screenshots_title text not null default 'Screenshots',
  product_screenshot_label_prefix text not null default 'Screenshot',
  product_primary_cta_fallback_label text not null default 'Open Product',
  about_eyebrow text not null default '',
  about_title text not null default '',
  about_description text not null default '',
  about_avatar_url text not null default '',
  about_intro_heading text not null default '',
  about_paragraphs jsonb not null default '[]'::jsonb,
  about_social_links jsonb not null default '[]'::jsonb,
  admin_posts_empty_state text not null default 'Select a post or create a new one.',
  admin_products_empty_state text not null default 'Select a product or create a new one.',
  admin_product_no_date_label text not null default 'No publish date',
  footer_logo_url text not null default '',
  footer_slogan text not null default '',
  footer_description text not null default '',
  footer_right_copy text not null default '',
  footer_copyright text not null default '',
  footer_social_links jsonb not null default '[]'::jsonb,
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

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;
