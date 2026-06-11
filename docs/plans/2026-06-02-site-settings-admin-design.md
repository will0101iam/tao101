# Site Settings Admin Design

## Goal

Add a dedicated `Settings` area inside the existing admin CMS so fixed site content is no longer hard-coded in the frontend.

This first version covers:

- Home hero text and CTA links
- Products section heading and description
- Blog section heading and description
- About section title, body copy, avatar, and social links
- Footer slogan, body copy, right-column copy, copyright, and footer social links

Long-term direction:

- All non-post, non-product fixed website copy should move into the same settings system instead of being edited in code.

## Why This Change

The current site mixes two different content models:

- Dynamic content already managed in CMS: posts and products
- Fixed content still hard-coded in frontend files: homepage copy, about text, social links, footer copy

This causes several problems:

- Small wording changes still require code edits and redeploys
- Social link labels and URLs are disconnected from admin workflows
- Home and footer content have no source of truth
- The site cannot fully meet the goal of "all website content configurable in the backend"

## Chosen Approach

Create a new content domain called `Site Settings` rather than stuffing fixed-copy fields into posts or products.

This becomes the third CMS domain:

- `Posts`
- `Products`
- `Settings`

This approach is preferred because it keeps content ownership clear:

- Posts manage article content
- Products manage product content
- Settings manage global site presentation and links

## Scope

### In Scope

#### Home Hero

- Eyebrow text
- Main headline
- Supporting paragraph
- Primary CTA label
- Primary CTA URL
- Secondary CTA label
- Secondary CTA URL

#### Products Section

- Eyebrow text
- Section title
- Section description

#### Blog Section

- Eyebrow text
- Section title
- Section description
- Load more button label

#### About Section

- Eyebrow text
- Section title
- Section description
- Avatar image URL
- Intro heading
- Multi-paragraph body copy
- About social links:
  - label
  - URL

#### Footer

- Footer logo image URL
- Slogan
- Body copy
- Right-column copy
- Copyright line
- Footer social links

### Out of Scope

- Post body editing model changes
- Product body editing model changes
- Navigation redesign
- Multi-language support
- Per-page version history for settings
- Theme system

## Data Model

Use a single site-wide settings record rather than many small records.

Recommended type shape:

```ts
type SiteLink = {
  label: string;
  url: string;
};

type SiteSettings = {
  id: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;

  productsEyebrow: string;
  productsTitle: string;
  productsDescription: string;

  blogEyebrow: string;
  blogTitle: string;
  blogDescription: string;
  blogLoadMoreLabel: string;

  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutAvatarUrl: string;
  aboutIntroHeading: string;
  aboutParagraphs: string[];
  aboutSocialLinks: SiteLink[];

  footerLogoUrl: string;
  footerSlogan: string;
  footerDescription: string;
  footerRightCopy: string;
  footerCopyright: string;
  footerSocialLinks: SiteLink[];

  createdAt: string;
  updatedAt: string;
};
```

### Storage Notes

- Arrays such as `aboutParagraphs`, `aboutSocialLinks`, and `footerSocialLinks` should be stored as JSON/JSONB in Supabase
- Local fallback mode should store the same structure in `localStorage`
- A single-row storage pattern avoids unnecessary list management in admin

## CMS Architecture Changes

### Types

Add:

- `SiteSettings`
- `SiteLink`
- `SiteSettingsInput`

### Repository Layer

Extend the CMS repository with:

- `getSiteSettingsInitial()`
- `readSiteSettings()`
- `saveSiteSettings()`

Behavior should match existing post/product architecture:

- Local mode uses a seeded fallback object
- Supabase mode reads and writes the live record

### Public Content Layer

Expose:

- `getSiteSettingsInitial()`
- `readPublishedSiteSettings()`

Frontend pages should stop importing hard-coded strings once settings are wired in.

## Supabase Design

Add a new table:

```sql
create table if not exists public.site_settings (
  id text primary key,
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
  blog_eyebrow text not null default '',
  blog_title text not null default '',
  blog_description text not null default '',
  blog_load_more_label text not null default 'Load More',
  about_eyebrow text not null default '',
  about_title text not null default '',
  about_description text not null default '',
  about_avatar_url text not null default '',
  about_intro_heading text not null default '',
  about_paragraphs jsonb not null default '[]'::jsonb,
  about_social_links jsonb not null default '[]'::jsonb,
  footer_logo_url text not null default '',
  footer_slogan text not null default '',
  footer_description text not null default '',
  footer_right_copy text not null default '',
  footer_copyright text not null default '',
  footer_social_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
```

Recommended record strategy:

- Use a fixed id such as `default`
- Admin always edits the same record

RLS strategy should mirror current admin write/public read patterns:

- Public can read
- Authenticated admin can update

## Admin UX

Add a new route:

- `/admin/settings`

Add a new admin navigation item:

- `Settings`

### Layout Recommendation

Use the same visual language as posts/products admin:

- Left sidebar nav remains unchanged except for new item
- Main content area contains a structured settings form

### Settings Page Sections

- Hero
- Products Section
- Blog Section
- About
- Footer

### Field UX

- Plain text inputs for short copy
- Textareas for descriptions
- Repeater-style blocks for social links
- Repeater-style blocks for About paragraphs
- Shared save button with success/error messaging consistent with post/product editors

### Social Links Requirements

For About section:

- Link 1 label defaults to `微信公众号`
- Link 2 label defaults to `小红书`
- Link 3 label defaults to `Twitter`
- Each must have an editable URL

Do not hard-code these labels in the frontend after migration.

## Frontend Rendering Changes

### Home Page

Replace hard-coded strings in:

- hero
- products section heading
- blog section heading
- about heading and body
- about social links

With runtime values from site settings.

### Footer

Replace hard-coded values in:

- slogan
- footer description
- right-column copy
- footer social links
- copyright

With runtime values from site settings.

### Fallback Strategy

The site must still render if settings fail to load:

- Use seeded defaults matching the current desired copy
- Hydrate from Supabase when available

## Default Seed Content

Seed values should reflect the current approved website state, including:

- Existing hero copy
- Current section titles
- The user-provided About text
- About social labels:
  - `微信公众号`
  - `小红书`
  - `Twitter`

URLs can seed as empty strings if not yet known, but labels must be correct.

## Error Handling

- If settings fetch fails, render seeded defaults
- If settings save fails, show inline error like existing editors
- If a social link URL is empty, still allow rendering the label in admin, but public UI should avoid dead `#` links where possible

## Testing Strategy

### Repository Tests

Add tests for:

- local fallback seed
- save and read roundtrip
- JSON array persistence for paragraph and social-link fields

### Admin Page Tests

Add tests for:

- loading existing settings
- editing and saving settings
- social link label/url fields
- about paragraph persistence
- success messaging

### Frontend Tests

Add tests to ensure:

- Home uses settings values
- Footer uses settings values
- About social labels render as configured

## Rollout Plan

Implement in this order:

1. Add settings types and seeds
2. Add local repository support
3. Add Supabase schema and repository support
4. Add admin settings page and route
5. Switch Home and Footer to settings-backed rendering
6. Add tests
7. Validate in browser

## Risks

### Risk: Settings page becomes too large

Mitigation:

- Group into clear sections
- Use simple vertical form layout first

### Risk: Frontend breaks if settings row does not exist

Mitigation:

- Seed a local default object
- In Supabase mode, create or fallback to a default record

### Risk: Dead social links in public UI

Mitigation:

- Prefer conditional rendering when URL is empty
- Keep label editable in admin regardless

## Recommendation

Proceed with a dedicated `Site Settings` content domain and `/admin/settings` page as the first step toward making all fixed site copy editable in the backend.

This is the cleanest architecture and best fits the long-term requirement that website content should no longer require code changes.
