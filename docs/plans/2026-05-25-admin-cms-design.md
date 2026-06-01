# Admin CMS Design

## Goal

Build a real admin backend for the site so Guotao Tao can manage the `products` and `blog` sections without editing code.

The admin must support:

- local use during development
- online use after deployment
- content editing without writing HTML
- image upload for covers and inline body images
- preserving the existing front-end visual style and interaction model

## Non-Goals

The first version will not include:

- tags or categories
- analytics dashboard
- multiple roles or multi-author support
- recycle bin
- advanced site settings
- full workflow features such as scheduled publishing

## Recommendation

Use `Supabase + /admin` as the first real content management system.

Why this is the right choice:

- it supports both local and deployed editing
- it removes the need to touch source files for routine content updates
- it is a better long-term fit than JSON editing or a git-based CMS for this project
- it allows the current front-end to keep its visual system while swapping the data source

## User Experience

### Admin Scope

The admin area will include:

- `/admin/login`
- `/admin/posts`
- `/admin/products`

This keeps the first version small and focused.

### Editing Experience

The editor should feel close to Notion instead of exposing HTML.

The content editor will support:

- paragraph blocks
- headings
- quotes
- code blocks
- links
- image blocks with upload

The user writes normal text. The system stores structured rich text JSON. The front-end renders that data with the site's existing typography and spacing.

This avoids raw HTML authoring while keeping future flexibility.

## Information Architecture

### Posts

Each post record will contain:

- `id`
- `title`
- `slug`
- `excerpt`
- `published_at`
- `cover_image_url`
- `content_json`
- `status`
- `created_at`
- `updated_at`

### Products

Each product record will contain:

- `id`
- `title`
- `slug`
- `excerpt`
- `cover_image_url`
- `content_json`
- `cta_label`
- `cta_url`
- `status`
- `created_at`
- `updated_at`

### Media

Images will be uploaded to Supabase Storage.

Use cases:

- blog cover image
- product cover image
- inline body images inside the editor

## Front-End Integration

### Current State

The current site uses local static content from `src/data`.

### Target State

Replace the static content access layer with a small data access layer that reads from Supabase.

Pages affected:

- home page blog cards
- home page product cards
- post detail page
- product detail page

The visual layout, hover states, card spacing, and detail page styling should remain intact. Only the data source changes.

### Rendering Strategy

- list pages fetch published content only
- detail pages fetch a single published record by `slug`
- admin pages can read draft and published content

## Admin Flows

### Post Management

The editor can:

- create a post
- edit title, excerpt, date, cover
- write body content in rich text
- insert inline images
- save as draft
- publish or unpublish
- delete

### Product Management

The editor can:

- create a product
- edit title, excerpt, cover
- write product story content in rich text
- set CTA label and CTA URL
- save as draft
- publish or unpublish
- delete

## Security

Authentication will use Supabase Auth.

First version assumptions:

- single admin user
- admin routes protected at the client and data layer
- row-level security policies allow public read of published content only
- insert, update, and delete restricted to authenticated admin

## Error Handling

The UI should explicitly handle:

- login failure
- save failure
- image upload failure
- missing slug or deleted content
- empty list state for posts and products

Basic UX expectations:

- clear loading states
- inline validation messages
- success toasts after save or publish

## Migration Strategy

The first implementation can keep the current local content during development and migrate in stages:

1. add Supabase schema and storage
2. build admin login and CRUD screens
3. switch product content to Supabase
4. switch blog content to Supabase
5. remove or deprecate local static content source

This reduces risk and keeps the site usable during the transition.

## Testing Strategy

Focus on the following:

- auth guard for `/admin`
- create and edit flow for posts
- create and edit flow for products
- image upload flow
- public site rendering of published content
- slug-based detail page loading
- draft items hidden from public pages

Verification should include:

- local manual QA
- type checks and build verification
- a small number of focused integration tests around data loading and route protection

## Open Decisions Resolved

The following product decisions have already been resolved:

- use a real backend, not mock editing
- support both local and deployed editing
- use a Notion-like rich text editor
- keep the first version intentionally small
- manage only blog and product content in V1

## Implementation Summary

The first version should deliver a simple but real CMS:

- Supabase database
- Supabase storage
- Supabase auth
- `/admin` login and CRUD screens
- rich text editing without HTML authoring
- public pages reading real content from Supabase

This is the smallest version that solves the real problem permanently.
