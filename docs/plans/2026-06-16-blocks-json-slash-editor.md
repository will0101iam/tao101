# Blocks JSON Slash Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add admin-only `blocks_json` persistence and a lightweight slash command menu while keeping frontend rendering on `content_html`.

**Architecture:** The admin keeps the current visual HTML editor, then derives a normalized block array from the editor DOM on save. A small browser-safe `admin-blocks.js` utility owns block conversion and slash command metadata so it can be tested separately. Supabase receives both `content_html` and `blocks_json`; frontend code remains unchanged.

**Tech Stack:** Static HTML/CSS/JS, Supabase JS v2, PostgreSQL `jsonb`, Node test runner for pure conversion utilities, browser verification for editor behavior.

---

### Task 1: Test Block Conversion Utilities

**Files:**
- Create: `web_new/admin-blocks.js`
- Create: `web_new/tests/admin-blocks.test.cjs`

**Steps:**
1. Write tests for converting article HTML into paragraph, heading, quote, list, image, divider, and code blocks.
2. Write tests for rendering those blocks back to stable HTML.
3. Write tests for slash command metadata.
4. Run `node web_new/tests/admin-blocks.test.cjs` and confirm it fails before implementation.

### Task 2: Implement Block Conversion Utilities

**Files:**
- Modify: `web_new/admin-blocks.js`

**Steps:**
1. Implement `htmlToBlocks(html)`.
2. Implement `blocksToHtml(blocks)`.
3. Implement `getSlashCommands()`.
4. Expose utilities as `window.REY_BLOCKS` in browser and `module.exports` in tests.
5. Run `node web_new/tests/admin-blocks.test.cjs`.

### Task 3: Add Database Column Locally and Remotely

**Files:**
- Modify: `web_new/supabase/schema.sql`
- Create: `web_new/supabase/2026-06-16-add-blocks-json.sql`

**Steps:**
1. Add `blocks_json jsonb not null default '[]'::jsonb` to `posts`.
2. Add `blocks_json jsonb not null default '[]'::jsonb` to `products`.
3. Execute the additive migration against the configured Supabase project.
4. Verify both remote tables expose `blocks_json`.

### Task 4: Wire Admin Double-Write

**Files:**
- Modify: `web_new/admin.html`
- Modify: `web_new/admin.js`

**Steps:**
1. Load `admin-blocks.js` before `admin.js`.
2. Include `blocks_json` in `mapPost` and `mapProduct`.
3. Store current blocks in the editor state.
4. On save, derive blocks from sanitized HTML and include `blocks_json` in insert/update payloads.
5. Keep `content_html` unchanged for frontend rendering.

### Task 5: Replace Toolbar With Slash Commands

**Files:**
- Modify: `web_new/admin.html`
- Modify: `web_new/admin.js`
- Modify: `web_new/styles.css`

**Steps:**
1. Remove the persistent format bar from the visible editing flow.
2. Add a floating slash menu container.
3. Detect `/` while the visual editor is in Edit mode.
4. Show the slash menu near the editor selection.
5. Apply block-level commands: paragraph, H2, H3, quote, bullet list, image, divider, code.
6. Hide the menu on Escape, outside click, Preview mode, or after command selection.

### Task 6: Verify

**Commands and checks:**
1. `node web_new/tests/admin-blocks.test.cjs`
2. `node --check web_new/admin.js`
3. `node --check web_new/admin-blocks.js`
4. Browser check:
   - login works
   - Posts load
   - Products load
   - `/` menu appears only in Edit mode
   - selecting slash commands changes the editor body
   - save sends `blocks_json`
   - frontend pages still render from `content_html`
