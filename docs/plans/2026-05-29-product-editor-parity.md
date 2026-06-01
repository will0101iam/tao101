# Product Editor Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the product editor so it matches the blog editor UX while keeping publish date, optional CTA fields, and a separate screenshot gallery.

**Architecture:** Reuse the post editor interaction model for product editing instead of maintaining a separate simpler form. Extend the product content model with publish date and screenshots, then wire the admin editor, persistence layer, and public product detail page to the new fields.

**Tech Stack:** React 19, Vite, TypeScript, Supabase, Vitest, Playwright

---

### Task 1: Extend Product Content Model

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/lib/cms.ts`
- Test: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add tests that prove products can persist:
- `date`
- `screenshots`
- optional CTA fields left empty

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cms.test.ts`

Expected: FAIL because product type/storage does not yet support these fields.

**Step 3: Write minimal implementation**

Add `date` and `screenshots` to product types plus local/Supabase serializers.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/cms.test.ts`

Expected: PASS

### Task 2: Bring Product Editor to Post Editor Parity

**Files:**
- Modify: `src/pages/admin/ProductEditor.tsx`
- Reuse patterns from: `src/pages/admin/PostEditor.tsx`
- Test: `src/pages/admin/ProductEditor.test.tsx`

**Step 1: Write the failing test**

Add tests covering:
- publish date field exists and syncs on product switch
- cover upload preview works
- screenshot gallery supports multiple images
- CTA fields are optional
- success feedback persists after save

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/admin/ProductEditor.test.tsx`

Expected: FAIL because current product editor lacks these interactions.

**Step 3: Write minimal implementation**

Rebuild the product editor to mirror post editor sections:
- title
- excerpt
- publish date
- status
- cover media
- screenshot gallery
- body
- optional CTA

**Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/admin/ProductEditor.test.tsx`

Expected: PASS

### Task 3: Persist Screenshot Gallery Media

**Files:**
- Modify: `src/lib/cms.ts`
- Modify: `src/pages/admin/ProductEditor.tsx`
- Test: `src/lib/cms.test.ts`
- Test: `src/pages/admin/ProductEditor.test.tsx`

**Step 1: Write the failing test**

Add tests proving screenshot uploads store multiple image URLs and preserve order.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cms.test.ts src/pages/admin/ProductEditor.test.tsx`

Expected: FAIL because screenshot gallery persistence is missing.

**Step 3: Write minimal implementation**

Persist screenshot arrays in local mode and Supabase mode. Keep cover and screenshots independent.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/cms.test.ts src/pages/admin/ProductEditor.test.tsx`

Expected: PASS

### Task 4: Update Public Product Page

**Files:**
- Modify: `src/pages/Product.tsx`
- Modify: `src/pages/Home.tsx` if needed for product card consistency
- Test: product-page test file if present, otherwise add focused regression coverage

**Step 1: Write the failing test**

Add a test that proves:
- product detail shows cover first
- screenshot gallery renders below cover
- CTA button only renders when URL exists
- publish date renders when present

**Step 2: Run test to verify it fails**

Run the focused product page test.

Expected: FAIL because public product page does not yet use new fields.

**Step 3: Write minimal implementation**

Render the new product metadata and screenshot gallery without changing the main content flow.

**Step 4: Run test to verify it passes**

Run the focused product page test.

Expected: PASS

### Task 5: Verification

**Files:**
- Review: all changed files

**Step 1: Run targeted suite**

Run:

```bash
npm test -- src/lib/cms.test.ts src/pages/admin/ProductEditor.test.tsx
```

**Step 2: Run diagnostics**

Use diagnostics on all changed files and fix any introduced issues.

**Step 3: Manual verification**

Check:
- `http://localhost:5182/admin/products`
- create/edit a product
- upload a cover
- upload multiple screenshots
- leave CTA blank
- publish product
- verify `http://localhost:5181/` product detail renders correctly
