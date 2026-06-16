# Logo Replacement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the site's default shared header/footer logo with the new `777.png` asset stored inside the project.

**Architecture:** Store the new image in `public` so Vite serves it as a stable site-relative asset, then point the seeded `footerLogoUrl` setting at that path. Leave remote Supabase settings unchanged for now so production does not reference an undeployed asset.

**Tech Stack:** Vite, React, TypeScript

---

### Task 1: Add the static logo asset

**Files:**
- Create: `public/logo-symbol.png`

**Step 1: Copy the approved logo into `public`**

Run:

```bash
cp /Users/bytedance/Desktop/1400/777.png /Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/public/logo-symbol.png
```

**Step 2: Verify the file exists**

Run:

```bash
ls -l /Users/bytedance/Desktop/1400/ai-coding-portfolio/.worktrees/admin-cms/public/logo-symbol.png
```

Expected: file exists and is readable.

### Task 2: Point seeded settings to the new asset

**Files:**
- Modify: `src/data/index.ts`

**Step 1: Update the default footer logo URL**

Change the seeded `footerLogoUrl` value from the external image to the new site-relative path:

```ts
footerLogoUrl: "/logo-symbol.png",
```

**Step 2: Keep header/footer rendering unchanged**

Do not change `SiteLayout` sizing yet. Both logo placements already read `siteSettings.footerLogoUrl`.

### Task 3: Verify the change

**Files:**
- Verify: `src/components/SiteLayout.tsx`

**Step 1: Build the project**

Run:

```bash
npm run build
```

Expected: successful Vite build.

**Step 2: Check git diff**

Run:

```bash
git status --short
```

Expected: only the new image and seeded logo URL change are present.
