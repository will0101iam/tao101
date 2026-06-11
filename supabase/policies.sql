alter table public.posts enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;

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

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "Authenticated users manage site settings" on public.site_settings;
create policy "Authenticated users manage site settings"
on public.site_settings
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

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
