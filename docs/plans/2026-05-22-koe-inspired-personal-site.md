# Dan Koe Inspired Personal Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the existing `ai-coding-portfolio` homepage into a Dan Koe-inspired one-page personal brand site with mock writing, social, and vibe coding product content.

**Architecture:** Keep the current Vite + React app and reuse the dark visual system, but replace the homepage information architecture with a stronger editorial landing page. Preserve routing, simplify navigation, and use lightweight static mock arrays inside the page so the visual direction can be reviewed quickly before real content is wired in.

**Tech Stack:** React, TypeScript, React Router, Tailwind utility classes, Vitest

---

### Task 1: Reshape global site chrome

**Files:**
- Modify: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/components/SiteLayout.tsx`

**Step 1: Update header and footer structure**

- Replace the current portfolio-style header labels with a personal brand identity.
- Keep a sticky header with a single CTA-like nav item to preserve the premium landing feel.

**Step 2: Keep existing background system**

- Reuse the dark gradients and grid texture so the redesign stays visually coherent with the current codebase.

**Step 3: Verify visually in browser**

Run: `npm run dev`
Expected: header feels more like a creator homepage than a filtered portfolio site.

### Task 2: Replace homepage information architecture

**Files:**
- Modify: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/pages/Home.tsx`

**Step 1: Write a homepage rendering test**

- Add a focused test for the new homepage copy and section structure before implementation.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/homepage.test.tsx`
Expected: FAIL because the new sections are not present yet.

**Step 3: Implement minimal homepage redesign**

- Replace project-filter logic with static mock arrays for:
  - featured resources / products
  - writing posts
  - social presence
- Build sections in order:
  - hero
  - resources
  - writing
  - about
  - final CTA

**Step 4: Run test to verify it passes**

Run: `npm test -- src/homepage.test.tsx`
Expected: PASS

### Task 3: Align secondary page tone

**Files:**
- Modify: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/pages/ProcessPage.tsx`

**Step 1: Update page copy to match new personal-brand framing**

- Keep the same route, but change the language so it reads as an extension of the homepage instead of a portfolio appendix.

**Step 2: Verify visually**

Run: `npm run dev`
Expected: process page still fits the new homepage tone.

### Task 4: Add focused regression test

**Files:**
- Create: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/homepage.test.tsx`

**Step 1: Write one focused test**

```tsx
it("renders the Koe-inspired homepage sections", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

  expect(html).toContain("Work on interesting things.");
  expect(html).toContain("精选文章");
  expect(html).toContain("小工具 / 小产品");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/homepage.test.tsx`
Expected: FAIL because the old homepage content is still rendered.

**Step 3: Keep test green after implementation**

Run: `npm test -- src/homepage.test.tsx`
Expected: PASS

### Task 5: Verify and polish

**Files:**
- Modify: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/pages/Home.tsx`
- Modify: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/components/SiteLayout.tsx`
- Modify: `/Users/bytedance/Desktop/1400/ai-coding-portfolio/src/pages/ProcessPage.tsx`

**Step 1: Run targeted verification**

Run: `npm run test -- src/homepage.test.tsx && npm run build`
Expected: tests pass and production build succeeds.

**Step 2: Check diagnostics**

- Review diagnostics for edited files and fix any easy issues.

**Step 3: Review in browser**

Run: `npm run dev`
Expected: one-page homepage feels close to Dan Koe’s pacing while remaining clearly personalized.
