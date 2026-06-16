# Blocks JSON Slash Editor Design

## Goal

Add a lightweight block content model for the `web_new` admin editor without changing frontend rendering. The public site continues to render `content_html`; `blocks_json` is introduced as an admin-side editing model and future migration path.

## Decisions

- Add `blocks_json jsonb not null default '[]'::jsonb` to both `posts` and `products`.
- Keep `content_html` as the source used by the current frontend.
- Save both fields from the admin editor:
  - `content_html` remains sanitized HTML.
  - `blocks_json` stores normalized block records derived from the current editor DOM.
- If a legacy row has no blocks, the admin derives blocks from `content_html` at load/save time.
- Add an AFFiNE/Notion-inspired slash menu only for block-level actions:
  - Paragraph
  - Heading 2
  - Heading 3
  - Quote
  - Bullet List
  - Image
  - Divider
  - Code
- Do not move inline formatting such as bold and italic into slash commands. Those remain keyboard/browser editing behavior, with Advanced Body HTML as the fallback.

## Non-Goals

- No frontend block renderer in this change.
- No CRDT, local-first sync engine, collaboration, or full BlockSuite integration.
- No complex Notion-style nested block editor.
- No destructive migration from HTML to blocks.

## Data Flow

1. Admin loads a post/product from Supabase.
2. Admin maps `blocks_json` if present; otherwise it derives blocks from `content_html`.
3. The visual editor still renders sanitized HTML using the current frontend-like `article-content` style.
4. Slash commands mutate the current DOM selection or insert a block into the editor.
5. Save sanitizes editor HTML and derives normalized blocks from the same DOM.
6. Supabase receives both `content_html` and `blocks_json`.
7. Frontend keeps reading `content_html`.

## Risk Controls

- Existing articles stay readable because `content_html` remains unchanged as the public rendering path.
- `blocks_json` is additive and can be ignored safely by frontend code.
- Advanced HTML remains available for migrated rich text edge cases.
- Tests cover HTML-to-block conversion, block-to-HTML conversion, and slash command metadata.
