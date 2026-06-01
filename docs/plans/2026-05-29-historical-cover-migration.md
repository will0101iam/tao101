# Historical Cover Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore original legacy cover images for seeded historical posts in Supabase while preserving the current explicit-cover-only rule for new CMS posts.

**Architecture:** Keep the editor behavior unchanged and make the migration deterministic. Source historical covers only from trusted legacy seed data, backfill empty Supabase rows once, and never infer covers from body images during this migration.

**Tech Stack:** React 19, Vite, TypeScript, Supabase, Vitest, Playwright

---

### Task 1: Define Historical Cover Source

**Files:**
- Modify: `src/lib/cms.ts`
- Review: `src/data/index.ts`
- Test: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add a test proving seeded historical posts can expose original legacy covers without changing the default empty-cover behavior for current CMS seed snapshots.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cms.test.ts`

Expected: FAIL because no historical-cover backfill helper exists.

**Step 3: Write minimal implementation**

Add a helper that maps legacy seed entries to trusted original covers for migration only, without changing `makeSeedPosts()` default `coverImage: ""`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/cms.test.ts`

Expected: PASS

### Task 2: Backfill Supabase Historical Posts

**Files:**
- Modify: `src/lib/cms.ts`
- Create or update: one-off migration script under project root if needed
- Test: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add a focused test that only empty-cover historical posts receive backfilled covers, while posts with existing covers remain unchanged.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cms.test.ts`

Expected: FAIL because no selective backfill exists.

**Step 3: Write minimal implementation**

Implement selective backfill logic and execute it against Supabase rows that match historical seeded posts and currently have empty `cover_image_url`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/cms.test.ts`

Expected: PASS

### Task 3: Verify Public Homepage Rendering

**Files:**
- Review: `src/pages/Home.tsx`
- Test: browser verification on `http://localhost:5181/`

**Step 1: Verify UI behavior**

Confirm the blog card UI already renders a cover when `post.coverImage` exists and a placeholder otherwise.

**Step 2: Run manual verification**

Open `http://localhost:5181/` and confirm historical cards now show restored covers.

**Step 3: Verify no regression**

Confirm a newly created post without an explicit cover still shows the empty-cover placeholder instead of an auto-generated image.

### Task 4: Cleanup and Diagnostics

**Files:**
- Review: changed files only

**Step 1: Run diagnostics**

Run diagnostics on changed files and fix any introduced issues.

**Step 2: Final verification**

Query Supabase to confirm historical posts now contain non-empty `cover_image_url` values.
