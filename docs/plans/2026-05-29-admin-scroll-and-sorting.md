# Admin Scroll And Sorting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make admin post/product lists sort by publish date descending, keep the left list panel internally scrollable, and keep rich text body scrolling inside the editor without constraining the full right-side form height.

**Architecture:** Move admin ordering into a shared CMS sorter so local and Supabase-backed admin views behave the same. Keep the two-column admin layout, but constrain only the left list panel and the rich text body region; the full editor form remains natural height.

**Tech Stack:** React 19, Vite, TypeScript, Supabase, Vitest, React Testing Library, Tailwind CSS

---

### Task 1: Unify Admin Sorting

**Files:**
- Modify: `src/lib/cms.ts`
- Test: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add regression tests proving admin posts/products are sorted by publish date descending, with `updatedAt` only used as a fallback.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cms.test.ts`

Expected: FAIL because admin collections currently sort only by `updatedAt`.

**Step 3: Write minimal implementation**

Add a shared admin sort helper and apply it to:
- `getAdminPosts`
- `getAdminProducts`
- `listPosts`
- `listProducts`

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/cms.test.ts`

Expected: PASS

### Task 2: Constrain Left List Panels

**Files:**
- Modify: `src/pages/admin/PostList.tsx`
- Modify: `src/pages/admin/ProductList.tsx`

**Step 1: Write the failing test**

Add focused rendering tests or assertions proving the left rail is an internally scrollable panel and does not rely on full-page growth.

**Step 2: Run test to verify it fails**

Run the focused admin list tests.

Expected: FAIL because lists are currently simple stacked content without constrained scrolling.

**Step 3: Write minimal implementation**

Wrap each left rail in:
- a fixed-height desktop panel
- a scrollable list body
- unchanged right-side editor area height behavior

**Step 4: Run test to verify it passes**

Run the focused admin list tests.

Expected: PASS

### Task 3: Make Rich Text Body Scroll Internally

**Files:**
- Modify: `src/components/editor/RichTextEditor.tsx`
- Modify: `src/styles.css`
- Test: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

Add a regression test proving:
- the toolbar remains in its own fixed shell
- the body editor uses an internal scroll region
- the editor content area has a maximum height instead of infinite growth

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`

Expected: FAIL because the editor currently renders toolbar and body as one unconstrained stack.

**Step 3: Write minimal implementation**

Split the editor into:
- toolbar shell
- scrollable body shell
- bounded body height

Keep the right-side form naturally sized.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`

Expected: PASS

### Task 4: Verify Admin UX

**Files:**
- Review: changed admin files

**Step 1: Run targeted tests**

```bash
npm test -- src/lib/cms.test.ts src/components/editor/RichTextEditor.test.tsx
```

**Step 2: Run diagnostics**

Check diagnostics for all changed files and fix introduced issues.

**Step 3: Manual verification**

Check:
- `http://localhost:5182/admin/posts`
- `http://localhost:5182/admin/products`
- newest published content is first
- left rail scrolls internally
- right form can remain long
- rich text body scrolls internally
- toolbar does not move with internal editor scrolling
