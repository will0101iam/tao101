# Site Settings Admin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated `/admin/settings` workflow so homepage, About, social links, and footer copy can be configured in the CMS instead of being hard-coded in the frontend.

**Architecture:** Introduce a new `SiteSettings` content domain parallel to posts and products. Seed a single settings record for local mode, back it with a new Supabase `site_settings` table for hosted mode, add a Settings editor page in admin, and switch Home/Footer rendering to read the settings repository with graceful fallback.

**Tech Stack:** React 19, TypeScript, React Router, Vite, Tailwind CSS v4, Vitest, React Testing Library, Supabase, localStorage fallback CMS

---

### Task 1: Define site settings types and seeds

**Files:**
- Modify: [content.ts](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/types/content.ts)
- Modify: [index.ts](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/data/index.ts)
- Test: [cms.test.ts](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/lib/cms.test.ts)

**Step 1: Write the failing test**

Add a test in `src/lib/cms.test.ts` that expects a default settings object to:

- exist in local mode
- include current homepage/footer defaults
- include `aboutSocialLinks` labels:
  - `微信公众号`
  - `小红书`
  - `Twitter`

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/cms.test.ts
```

Expected: FAIL because site settings types and seed readers do not exist yet.

**Step 3: Write minimal implementation**

In `src/types/content.ts`:

- add `SiteLink`
- add `SiteSettings`
- add `SiteSettingsInput`

In `src/data/index.ts`:

- define a single seeded site settings object using current approved homepage/about/footer copy

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/cms.test.ts
```

Expected: PASS for the new seed-default assertions.

**Step 5: Commit**

```bash
git add src/types/content.ts src/data/index.ts src/lib/cms.test.ts
git commit -m "feat: add site settings content model"
```

### Task 2: Add CMS repository support for site settings

**Files:**
- Modify: [cms.ts](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/lib/cms.ts)
- Modify: [cms.test.ts](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/lib/cms.test.ts)

**Step 1: Write the failing test**

Extend `src/lib/cms.test.ts` with tests for:

- `readSiteSettings()` returning seeded defaults in local mode
- `saveSiteSettings()` updating title, about paragraphs, and social links
- JSON arrays round-tripping correctly

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/cms.test.ts
```

Expected: FAIL because repository functions and storage keys do not exist.

**Step 3: Write minimal implementation**

In `src/lib/cms.ts`:

- add a new local storage key for site settings
- add a single-record reader/writer pattern
- support local fallback and Supabase mode
- expose:
  - `getSiteSettingsInitial()`
  - `readSiteSettings()`
  - `saveSiteSettings()`

Re-use current local fallback and Supabase branching style from posts/products.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/cms.test.ts
```

Expected: PASS for new site settings repository tests.

**Step 5: Commit**

```bash
git add src/lib/cms.ts src/lib/cms.test.ts
git commit -m "feat: add site settings repository support"
```

### Task 3: Add public content access for site settings

**Files:**
- Modify: [publicContent.ts](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/lib/publicContent.ts)
- Test: [Home.test.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/Home.test.tsx) if present, otherwise create one

**Step 1: Write the failing test**

Add or create a Home-focused test that expects the page to render settings-backed values instead of hard-coded strings.

At minimum assert:

- About social labels render from settings
- About body copy renders from settings

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: FAIL because no public settings adapter exists yet.

**Step 3: Write minimal implementation**

In `src/lib/publicContent.ts`:

- add `getSiteSettingsInitial()`
- add `readPublishedSiteSettings()`
- normalize JSON arrays and fallback values

Keep behavior parallel to current post/product public readers.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: PASS for settings-based rendering expectations that are already wired.

**Step 5: Commit**

```bash
git add src/lib/publicContent.ts src/pages/Home.test.tsx
git commit -m "feat: add public site settings adapter"
```

### Task 4: Add Supabase schema for site settings

**Files:**
- Modify: [schema.sql](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/supabase/schema.sql)
- Modify: `supabase/policies.sql` if needed for public read/admin write
- Reference: [2026-06-02-site-settings-admin-design.md](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/docs/plans/2026-06-02-site-settings-admin-design.md)

**Step 1: Write the failing test**

If schema snapshot tests exist, extend them. If not, use a focused repository test in Supabase-mode mocking that expects site settings fields to map to SQL-compatible columns.

**Step 2: Run test to verify it fails**

Run the smallest relevant test command:

```bash
npm test -- src/lib/cms.test.ts
```

Expected: FAIL or incomplete coverage for Supabase site settings path.

**Step 3: Write minimal implementation**

In `supabase/schema.sql`:

- create `public.site_settings`
- use a single-row id pattern like `default`
- store paragraph/link arrays as `jsonb`

In `supabase/policies.sql`:

- add read policy consistent with public content usage
- add authenticated admin write/update policy consistent with current CMS auth model

In `src/lib/cms.ts`:

- map Supabase rows to `SiteSettings`
- upsert the fixed row id

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/cms.test.ts
```

Expected: PASS for repository mapping tests.

**Step 5: Commit**

```bash
git add supabase/schema.sql supabase/policies.sql src/lib/cms.ts src/lib/cms.test.ts
git commit -m "feat: add supabase site settings schema"
```

### Task 5: Add admin Settings page and route

**Files:**
- Create: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/admin/SettingsEditor.tsx`
- Create: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/admin/SettingsEditor.test.tsx`
- Modify: [App.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/App.tsx)
- Modify: [AdminLayout.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/admin/AdminLayout.tsx)

**Step 1: Write the failing test**

In `SettingsEditor.test.tsx`, cover:

- loading existing settings
- editing About paragraphs
- editing social link labels and URLs
- saving successfully
- showing success feedback

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/pages/admin/SettingsEditor.test.tsx
```

Expected: FAIL because the page and route do not exist.

**Step 3: Write minimal implementation**

Create a settings editor page with sections:

- Hero
- Products Section
- Blog Section
- About
- Footer

Requirements:

- text inputs for short copy
- textareas for longer copy
- simple grouped inputs for 3 About social links
- save button with inline success/error state
- use existing admin visual language instead of inventing a new shell

Update routes:

- add `/admin/settings`

Update admin nav:

- add a `Settings` link

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/pages/admin/SettingsEditor.test.tsx
```

Expected: PASS for form load/edit/save behavior.

**Step 5: Commit**

```bash
git add src/pages/admin/SettingsEditor.tsx src/pages/admin/SettingsEditor.test.tsx src/App.tsx src/pages/admin/AdminLayout.tsx
git commit -m "feat: add admin settings editor"
```

### Task 6: Switch Home page to settings-backed rendering

**Files:**
- Modify: [Home.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/Home.tsx)
- Modify: [Home.test.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/Home.test.tsx)

**Step 1: Write the failing test**

Extend Home tests so the page must render:

- hero text from settings
- section titles from settings
- About copy from settings
- About social link labels and URLs from settings

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: FAIL because Home still contains hard-coded strings.

**Step 3: Write minimal implementation**

In `src/pages/Home.tsx`:

- load site settings via public content adapter
- replace hard-coded strings with settings fields
- map About paragraphs dynamically
- map About social links dynamically
- avoid dead `href="#"` when a URL is empty

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: PASS for settings-backed homepage rendering.

**Step 5: Commit**

```bash
git add src/pages/Home.tsx src/pages/Home.test.tsx
git commit -m "feat: render home content from site settings"
```

### Task 7: Switch Footer to settings-backed rendering

**Files:**
- Modify: [SiteLayout.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/components/SiteLayout.tsx)
- Modify: [Home.test.tsx](file:///Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/src/pages/Home.test.tsx) or add a dedicated layout test

**Step 1: Write the failing test**

Add assertions that footer slogan, description, right copy, and social links come from settings values.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: FAIL because footer strings remain hard-coded.

**Step 3: Write minimal implementation**

In `src/components/SiteLayout.tsx`:

- accept settings data or read it via shared provider/prop pattern
- replace hard-coded footer copy and link URLs
- keep current layout/styling unchanged

Use the smallest architecture that avoids duplicate fetching.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: PASS for footer settings rendering.

**Step 5: Commit**

```bash
git add src/components/SiteLayout.tsx src/pages/Home.test.tsx
git commit -m "feat: render footer content from site settings"
```

### Task 8: Run focused regression and diagnostics

**Files:**
- Modify only if regressions are found
- Check: relevant edited files with diagnostics

**Step 1: Run focused tests**

Run:

```bash
npm test -- src/lib/cms.test.ts src/pages/admin/SettingsEditor.test.tsx src/pages/Home.test.tsx
```

Expected: PASS

**Step 2: Run build**

Run:

```bash
npm run build
```

Expected: PASS

**Step 3: Run diagnostics**

Check diagnostics for:

- `src/pages/admin/SettingsEditor.tsx`
- `src/pages/Home.tsx`
- `src/components/SiteLayout.tsx`
- `src/lib/cms.ts`
- `src/lib/publicContent.ts`

Expected: no new errors

**Step 4: Browser verification**

Verify:

- `/admin/settings` loads
- About social labels show `微信公众号` / `小红书` / `Twitter`
- editing settings updates the public homepage
- footer text updates correctly

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify site settings cms flow"
```

