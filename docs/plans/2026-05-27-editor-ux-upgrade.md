# Editor UX Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the admin post editor with real cover workflows, visible/editable links, and a compact icon-based toolbar that matches the site's editorial UI.

**Architecture:** Keep the current TipTap-based editor and extend it instead of replacing it. Add missing editor extensions, move the cover controls into a dedicated media workflow above the body, and keep frontend and backend content rendering aligned through shared styling and explicit behavior tests.

**Tech Stack:** React 19, Vite, TypeScript, TipTap, Tailwind CSS v4, Vitest, React Testing Library, Playwright

---

### Task 1: Lock the Cover Picker Requirements

**Files:**
- Modify: `src/pages/admin/PostEditor.test.tsx`
- Modify: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add tests for:
- showing a cover upload action
- showing selectable body-image candidates when the editor content contains images
- selecting a body image as cover
- keeping the existing valid auto-cover fallback behavior

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts`
Expected: FAIL because the current editor only supports a raw URL field and preview.

**Step 3: Write minimal implementation**

Do not touch production code in this task. Only add the tests that define the desired cover workflow.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts`
Expected: FAIL on the new cover workflow assertions, not on setup errors.

**Step 5: Commit**

```bash
git add src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts
git commit -m "test: cover editor workflow expectations"
```

### Task 2: Implement Cover Upload and Body Image Selection

**Files:**
- Modify: `src/pages/admin/PostEditor.tsx`
- Modify: `src/lib/cms.ts`
- Test: `src/pages/admin/PostEditor.test.tsx`
- Test: `src/lib/cms.test.ts`

**Step 1: Write the failing test**

Add or refine tests to prove:
- clicking upload uses `uploadImage`
- uploaded URL becomes the selected cover
- body image candidates are deduplicated
- choosing a body image updates the cover preview and the saved value

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts`
Expected: FAIL because the current UI has no candidate strip or upload-specific cover action.

**Step 3: Write minimal implementation**

Update `PostEditor` so the cover area includes:
- upload button
- manual URL input
- helper copy
- thumbnail strip populated from current body images
- selectable active state for the chosen cover

Keep `coverImage` as the saved field. Keep the existing migration logic in `cms.ts`, but ensure it remains compatible with the explicit cover picker.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/admin/PostEditor.tsx src/lib/cms.ts src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts
git commit -m "feat: add cover upload and body image selection"
```

### Task 3: Lock Link Editing Behavior

**Files:**
- Modify: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

Add tests for:
- rendering link-related toolbar actions
- visible link styling in editor content
- editing an existing link URL
- removing a link

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL because the current editor only exposes a simple link prompt and does not support full edit/remove flows.

**Step 3: Write minimal implementation**

Only update the tests in this step.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL on missing link workflow behavior.

**Step 5: Commit**

```bash
git add src/components/editor/RichTextEditor.test.tsx
git commit -m "test: define link editing workflow"
```

### Task 4: Implement Visible and Editable Links

**Files:**
- Modify: `src/components/editor/RichTextEditor.tsx`
- Modify: `src/styles.css`
- Test: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

Refine tests so they prove:
- the editor shows a dedicated remove-link action
- links inside editor content receive visible styling
- editing an existing link keeps the selected text and updates the URL

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL because the editor does not yet expose the richer link workflow.

**Step 3: Write minimal implementation**

Update `RichTextEditor` to:
- detect whether selection is inside a link
- allow editing the existing URL
- allow clearing the link
- style links inside `.editor-content` clearly enough to read during editing

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/editor/RichTextEditor.tsx src/styles.css src/components/editor/RichTextEditor.test.tsx
git commit -m "feat: improve editor link editing"
```

### Task 5: Upgrade the Toolbar to Icon UI

**Files:**
- Modify: `package.json`
- Modify: `src/components/editor/RichTextEditor.tsx`
- Modify: `src/components/editor/RichTextEditor.test.tsx`
- Modify: `src/styles.css`

**Step 1: Write the failing test**

Add tests that lock:
- compact icon action buttons with accessible names
- tooltip labels for each action
- the expanded action set:
  - paragraph
  - H2
  - H3
  - bold
  - italic
  - underline
  - blockquote
  - code block
  - bullet list
  - ordered list
  - align left
  - align center
  - link
  - unlink
  - image

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL because the current toolbar still uses larger text buttons and lacks several formatting controls.

**Step 3: Write minimal implementation**

Add the required icon system, preferably `lucide-react`, then:
- replace large text buttons with icon buttons
- preserve accessibility names via `aria-label`
- add tooltip text
- expose bold, italic, underline, align-left, and align-center actions
- keep active-state highlighting subtle and premium

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json src/components/editor/RichTextEditor.tsx src/components/editor/RichTextEditor.test.tsx src/styles.css
git commit -m "feat: upgrade editor toolbar to icon ui"
```

### Task 6: Add Missing TipTap Extensions

**Files:**
- Modify: `package.json`
- Modify: `src/components/editor/RichTextEditor.tsx`
- Test: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

Add a smoke test that confirms the new formatting actions exist only when the supporting extensions are loaded.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: FAIL until underline and text alignment support are wired in.

**Step 3: Write minimal implementation**

Add and configure:
- `@tiptap/extension-underline`
- `@tiptap/extension-text-align`

Limit alignment support to headings and paragraphs so behavior stays predictable.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/editor/RichTextEditor.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json src/components/editor/RichTextEditor.tsx src/components/editor/RichTextEditor.test.tsx
git commit -m "feat: add underline and alignment support"
```

### Task 7: Keep Public Post Rendering Stable

**Files:**
- Modify: `src/pages/Post.test.tsx`
- Modify: `src/styles.css`
- Modify: `src/pages/Post.tsx`

**Step 1: Write the failing test**

Add or update a test that verifies the public post still renders:
- visible links
- aligned paragraphs/headings
- emphasis marks
- lists
- code blocks

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/Post.test.tsx`
Expected: FAIL if the frontend styling contract has drifted from the upgraded editor output.

**Step 3: Write minimal implementation**

Extend shared content styling only as much as needed so frontend output stays aligned with the upgraded editor semantics.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/pages/Post.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/Post.test.tsx src/styles.css src/pages/Post.tsx
git commit -m "style: align public post with upgraded editor"
```

### Task 8: Full Verification and Browser Regression

**Files:**
- No new files

**Step 1: Run targeted tests**

Run:

```bash
npm test -- src/pages/admin/PostEditor.test.tsx src/lib/cms.test.ts src/components/editor/RichTextEditor.test.tsx src/pages/Post.test.tsx
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
- type checking passes
- production build succeeds

**Step 3: Run browser regression**

Check manually in the running site:
- `/admin/posts`
- upload a new cover
- pick a cover from body images
- insert and edit a link
- apply bold, italic, underline, and center alignment
- verify toolbar icon states and tooltips
- verify `/post/:slug` still renders cleanly

**Step 4: Commit**

```bash
git add .
git commit -m "feat: upgrade editor ux"
```
