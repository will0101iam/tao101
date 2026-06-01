# Supabase Mainline Rollout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the CMS from local-only storage to a shared Supabase-backed content and media pipeline so `/admin` and the public site read the same published data.

**Architecture:** Keep the existing local fallback for safety, but make Supabase the primary path whenever env vars are configured. Reuse the existing `posts`, `products`, and `media` bucket schema, then harden the upload, auth, and published-content read paths with focused regression tests.

**Tech Stack:** React 19, Vite, TypeScript, Supabase (`@supabase/supabase-js`), Supabase Auth, Supabase Storage, Vitest, Playwright

---

### Task 1: Supabase Setup Validation

**Files:**
- Review: `src/lib/supabase.ts`
- Review: `supabase/schema.sql`
- Review: `supabase/policies.sql`
- Review: `.env.example`

**Step 1: Verify env contract**

Confirm the frontend only requires:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Step 2: Verify backend resources**

Confirm SQL provisions:
- `public.posts`
- `public.products`
- `storage.buckets.media`

**Step 3: Verify auth expectation**

Confirm `/admin/login` works with Supabase email/password users created in the dashboard.

### Task 2: Shared Published Content

**Files:**
- Modify: `src/lib/publicContent.ts`
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/Post.tsx`
- Modify: `src/pages/Product.tsx`
- Test: `src/pages/homepage.test.tsx`

**Step 1: Write failing regression test**

Add a test that proves published content loads from Supabase mode when env is enabled and falls back safely otherwise.

**Step 2: Run the focused test**

Run: `npm test -- src/homepage.test.tsx`

**Step 3: Keep async refresh + fallback behavior aligned**

Ensure the public pages start with snapshot content and refresh from Supabase without blanking the UI.

### Task 3: Media Upload Mainline

**Files:**
- Modify: `src/lib/cms.ts`
- Modify: `src/components/editor/RichTextEditor.tsx`
- Modify: `src/pages/admin/PostEditor.tsx`
- Modify: `src/pages/admin/ProductEditor.tsx`
- Test: `src/lib/cms.test.ts`
- Test: `src/pages/admin/PostEditor.test.tsx`

**Step 1: Write failing upload-path tests**

Cover:
- cover upload uses Supabase storage when enabled
- editor body image upload uses Supabase storage when enabled
- local fallback still works

**Step 2: Run the focused tests**

Run: `npm test -- src/lib/cms.test.ts src/pages/admin/PostEditor.test.tsx`

**Step 3: Implement minimal storage path**

Store uploads under deterministic folders, then return the public URL from the `media` bucket.

### Task 4: Admin Auth and Save Flow

**Files:**
- Modify: `src/context/AdminAuthContext.tsx`
- Modify: `src/lib/cms.ts`
- Modify: `src/pages/admin/PostEditor.tsx`
- Modify: `src/pages/admin/ProductEditor.tsx`
- Test: `src/pages/admin/PostEditor.test.tsx`

**Step 1: Write failing auth/save regression tests**

Cover:
- authenticated user can publish to Supabase
- success feedback remains visible after parent state sync
- local fallback remains unchanged

**Step 2: Run the focused tests**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx`

**Step 3: Implement minimal fixes**

Preserve the current UX while making the Supabase path the primary save path when env vars exist.

### Task 5: Verification and Handoff

**Files:**
- Review: `README.md`
- Review: `.env.example`

**Step 1: Run full targeted suite**

Run:

```bash
npm test -- src/lib/cms.test.ts src/pages/admin/PostEditor.test.tsx src/components/editor/RichTextEditor.test.tsx src/homepage.test.tsx
```

**Step 2: Manual verification**

Check:
- `http://localhost:5182/admin/posts`
- `http://localhost:5182/`
- publish a post, refresh the public site, confirm visibility
- upload cover and body images, confirm they resolve from Supabase

**Step 3: Update setup docs**

Document the exact env vars, SQL steps, storage bucket, and the requirement to create one admin email/password user in Supabase Auth.
