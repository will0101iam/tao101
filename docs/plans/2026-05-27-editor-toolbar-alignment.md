# Editor Toolbar Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the admin post editor so backend editing supports the same structural content as the public blog and exposes a fixed formatting toolbar that feels closer to WeChat/Notion-style publishing.

**Architecture:** Keep the existing TipTap-based editor, but extend it instead of replacing it. Add the missing block controls and shared content styling at the editor layer, align backend preview and frontend article rendering around one shared visual language, and preserve the existing `coverImage` field while making its relationship with body images explicit.

**Tech Stack:** React 19, Vite, TypeScript, TipTap, Tailwind CSS v4, Vitest, React Testing Library, Playwright

---

### Task 1: Lock Down Missing Editor Behaviors

**Files:**
- Modify: `src/components/editor/RichTextEditor.test.tsx`
- Modify: `src/pages/admin/PostEditor.test.tsx`

**Step 1: Write the failing tests**

Add focused tests that cover:
- rendering toolbar buttons for `H2`, `H3`, `Quote`, `Code`, `Bullet List`, `Ordered List`, `Link`, `Image`
- preserving existing HTML structures such as `<blockquote>`, `<pre><code>`, `<ul>`, `<ol>`, `<h2>`, `<h3>`
- rendering a cover preview in `PostEditor` when `coverImage` exists

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx src/pages/admin/PostEditor.test.tsx`
Expected: FAIL because the missing toolbar actions and editor rendering expectations are not implemented yet.

**Step 3: Write minimal implementation**

Only add the smallest test scaffolding required to assert the behaviors above. Do not change production code in this task.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx src/pages/admin/PostEditor.test.tsx`
Expected: FAIL on the new expectations, not on unrelated setup errors.

**Step 5: Commit**

```bash
git add src/components/editor/RichTextEditor.test.tsx src/pages/admin/PostEditor.test.tsx
git commit -m "test: cover editor toolbar gaps"
```

### Task 2: Upgrade the Fixed Toolbar

**Files:**
- Modify: `src/components/editor/RichTextEditor.tsx`
- Test: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

Assert that the toolbar now exposes:
- `Paragraph`
- `H2`
- `H3`
- `Quote`
- `Code`
- `Bullet List`
- `Ordered List`
- `Link`
- `Image`

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL because the current toolbar only exposes a single heading button and no list actions.

**Step 3: Write minimal implementation**

Update `RichTextEditor` to:
- keep `StarterKit`
- expose separate `H2` and `H3` buttons
- expose `toggleBulletList()` and `toggleOrderedList()`
- keep the existing link and image flows
- add active-state styling so the selected block type is visible

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/editor/RichTextEditor.tsx src/components/editor/RichTextEditor.test.tsx
git commit -m "feat: add fixed editor formatting toolbar"
```

### Task 3: Restore Backend Editing Visual Hierarchy

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/editor/RichTextEditor.tsx`
- Test: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

Add assertions that the editor root receives a stable editor-specific class name, for example `editor-content`, so styling is not dependent on the absent Tailwind typography plugin.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL because the current class list is not editor-specific enough to support dedicated styling.

**Step 3: Write minimal implementation**

Add shared editor styles in `src/styles.css` for:
- headings
- blockquotes
- code blocks
- inline code
- unordered and ordered lists
- body images
- spacing between blocks

Update the editor root class name in `RichTextEditor.tsx` so those styles apply consistently.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/styles.css src/components/editor/RichTextEditor.tsx src/components/editor/RichTextEditor.test.tsx
git commit -m "style: restore editor content hierarchy"
```

### Task 4: Align Public Article Rendering With Editor Output

**Files:**
- Modify: `src/pages/Post.tsx`
- Modify: `src/styles.css`
- Test: `src/pages/Post.test.tsx`

**Step 1: Write the failing test**

Add a rendering test that verifies a post containing headings, lists, blockquotes, code blocks, and images is displayed with the expected structural wrapper class.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/Post.test.tsx`
Expected: FAIL because the public post wrapper does not yet share the same styling contract as the editor.

**Step 3: Write minimal implementation**

Unify the frontend article body class and the backend editor display styles around a shared content class, while keeping the existing Dan Koe-inspired layout intact.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/Post.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/Post.tsx src/styles.css src/pages/Post.test.tsx
git commit -m "style: align public post rendering with editor output"
```

### Task 5: Clarify Cover Image vs Body Images

**Files:**
- Modify: `src/pages/admin/PostEditor.tsx`
- Modify: `src/lib/cms.ts`
- Test: `src/pages/admin/PostEditor.test.tsx`
- Test: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add tests for:
- showing a cover preview label that makes clear this is the article cover
- falling back to the first body image only when no cover exists
- preserving an explicitly chosen cover even if body images change

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts`
Expected: FAIL because the editor currently previews the URL but does not explain the distinction clearly enough.

**Step 3: Write minimal implementation**

Update the editor UI copy and migration helpers so:
- cover image remains an explicit field
- the UI explains that body images do not automatically replace the cover
- fallback behavior remains deterministic for legacy content

**Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/admin/PostEditor.tsx src/lib/cms.ts src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts
git commit -m "feat: clarify post cover image behavior"
```

### Task 6: Full Verification and Browser Regression

**Files:**
- No new files

**Step 1: Run targeted tests**

Run:

```bash
npm test -- src/components/editor/RichTextEditor.test.tsx src/pages/admin/PostEditor.test.tsx src/pages/Post.test.tsx src/lib/cms.test.ts
```

Expected: PASS

**Step 2: Run full project verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected:
- tests pass
- `tsc --noEmit` passes
- production build succeeds

**Step 3: Run browser regression**

Check manually in the running site:
- `/admin/posts`
- open one post with headings, code, lists, quotes, images
- confirm toolbar actions work
- confirm backend editor visual hierarchy is visible
- confirm public `/post/:slug` still matches the intended layout

**Step 4: Commit**

```bash
git add .
git commit -m "feat: align admin editor with public post formatting"
```
