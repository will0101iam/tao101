# Admin CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real `/admin` backend with Supabase so Guotao Tao can manage blog posts and products without editing code or writing HTML.

**Architecture:** Keep the current public site visual system intact and replace the static `src/data` content layer with a Supabase-backed repository layer. Add a protected admin area with Supabase Auth, a Notion-like rich text editor, image upload to Supabase Storage, and public pages that read only published content.

**Tech Stack:** React 19, React Router, TypeScript, Supabase (`@supabase/supabase-js`), TipTap rich text editor, Vitest, Vite

---

### Task 1: Install CMS Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Add the failing import smoke test**

Create a temporary test file:

```ts
import { describe, expect, it } from "vitest";

describe("cms dependencies", () => {
  it("loads supabase and editor packages", async () => {
    const supabase = await import("@supabase/supabase-js");
    const tiptapReact = await import("@tiptap/react");

    expect(supabase.createClient).toBeTypeOf("function");
    expect(tiptapReact.EditorContent).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test
```

Expected: FAIL with module not found errors for the new CMS packages.

**Step 3: Add minimal dependencies**

Install:

```bash
npm install @supabase/supabase-js @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
```

**Step 4: Run test to verify it passes**

Run:

```bash
npm test
```

Expected: PASS for the dependency smoke test.

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add admin cms dependencies"
```

### Task 2: Add Supabase Client and Content Types

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/types/content.ts`
- Modify: `src/data/index.ts`
- Test: `src/lib/supabase.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createSupabaseBrowserClient } from "./supabase";

describe("createSupabaseBrowserClient", () => {
  it("returns a client factory result", () => {
    const client = createSupabaseBrowserClient();
    expect(client).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/supabase.test.ts
```

Expected: FAIL because `src/lib/supabase.ts` does not exist.

**Step 3: Write minimal implementation**

Add a small Supabase wrapper:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
```

Add shared content types:

```ts
export type PublishStatus = "draft" | "published";

export type PostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
  cover_image_url: string | null;
  content_json: Record<string, unknown>;
  status: PublishStatus;
};

export type ProductRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  content_json: Record<string, unknown>;
  cta_label: string | null;
  cta_url: string | null;
  status: PublishStatus;
};
```

Refactor `src/data/index.ts` into a temporary compatibility layer that exports current static data plus placeholders for Supabase-backed fetch functions.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/supabase.test.ts
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/supabase.ts src/types/content.ts src/data/index.ts src/lib/supabase.test.ts
git commit -m "feat: add supabase client and content types"
```

### Task 3: Build Protected Admin Routing

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/components/admin/AdminGuard.tsx`
- Create: `src/pages/admin/Login.tsx`
- Create: `src/pages/admin/AdminLayout.tsx`
- Create: `src/pages/admin/PostList.tsx`
- Create: `src/pages/admin/ProductList.tsx`
- Test: `src/components/admin/AdminGuard.test.tsx`

**Step 1: Write the failing test**

```tsx
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminGuard from "./AdminGuard";

describe("AdminGuard", () => {
  it("redirects anonymous users to /admin/login", () => {
    render(
      <MemoryRouter initialEntries={["/admin/posts"]}>
        <Routes>
          <Route path="/admin/login" element={<div>login</div>} />
          <Route path="/admin/posts" element={<AdminGuard><div>secret</div></AdminGuard>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/admin/AdminGuard.test.tsx
```

Expected: FAIL because the guard and admin routes do not exist.

**Step 3: Write minimal implementation**

- Add `/admin/login`, `/admin/posts`, `/admin/products`
- Create an `AdminGuard` that checks auth session presence
- Add a minimal `AdminLayout` with navigation between posts and products

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/admin/AdminGuard.test.tsx
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/admin src/pages/admin
git commit -m "feat: add protected admin routes"
```

### Task 4: Implement Posts CRUD With Publish State

**Files:**
- Create: `src/lib/repositories/posts.ts`
- Create: `src/pages/admin/PostEditor.tsx`
- Modify: `src/pages/admin/PostList.tsx`
- Test: `src/lib/repositories/posts.test.ts`
- Test: `src/pages/admin/PostEditor.test.tsx`

**Step 1: Write the failing repository test**

```ts
import { describe, expect, it } from "vitest";
import { mapPostInputToInsert } from "./posts";

describe("mapPostInputToInsert", () => {
  it("maps editor input into a Supabase row", () => {
    const row = mapPostInputToInsert({
      title: "Hello",
      slug: "hello",
      excerpt: "World",
      status: "draft",
      publishedAt: null,
      coverImageUrl: null,
      contentJson: { type: "doc", content: [] },
    });

    expect(row.title).toBe("Hello");
    expect(row.status).toBe("draft");
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/repositories/posts.test.ts
```

Expected: FAIL because repository helpers do not exist.

**Step 3: Write minimal implementation**

- Add typed CRUD functions for posts
- Build post list screen
- Build post editor form with:
  - title
  - slug
  - excerpt
  - published date
  - cover upload field
  - editor content
  - draft/published toggle

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/repositories/posts.test.ts src/pages/admin/PostEditor.test.tsx
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/repositories/posts.ts src/pages/admin/PostList.tsx src/pages/admin/PostEditor.tsx src/lib/repositories/posts.test.ts src/pages/admin/PostEditor.test.tsx
git commit -m "feat: add admin post management"
```

### Task 5: Implement Products CRUD With CTA Fields

**Files:**
- Create: `src/lib/repositories/products.ts`
- Create: `src/pages/admin/ProductEditor.tsx`
- Modify: `src/pages/admin/ProductList.tsx`
- Test: `src/lib/repositories/products.test.ts`
- Test: `src/pages/admin/ProductEditor.test.tsx`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { mapProductInputToInsert } from "./products";

describe("mapProductInputToInsert", () => {
  it("keeps CTA fields", () => {
    const row = mapProductInputToInsert({
      title: "Tool",
      slug: "tool",
      excerpt: "desc",
      status: "published",
      coverImageUrl: null,
      contentJson: { type: "doc", content: [] },
      ctaLabel: "Open",
      ctaUrl: "https://example.com",
    });

    expect(row.cta_label).toBe("Open");
    expect(row.cta_url).toBe("https://example.com");
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/repositories/products.test.ts
```

Expected: FAIL because product repository helpers do not exist.

**Step 3: Write minimal implementation**

- Add product CRUD functions
- Build product list screen
- Build product editor form with:
  - title
  - slug
  - excerpt
  - cover image
  - content editor
  - CTA label
  - CTA URL
  - draft/published toggle

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/repositories/products.test.ts src/pages/admin/ProductEditor.test.tsx
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/repositories/products.ts src/pages/admin/ProductList.tsx src/pages/admin/ProductEditor.tsx src/lib/repositories/products.test.ts src/pages/admin/ProductEditor.test.tsx
git commit -m "feat: add admin product management"
```

### Task 6: Add Rich Text Editor and Image Upload

**Files:**
- Create: `src/components/editor/RichTextEditor.tsx`
- Create: `src/components/editor/EditorToolbar.tsx`
- Create: `src/lib/storage.ts`
- Modify: `src/pages/admin/PostEditor.tsx`
- Modify: `src/pages/admin/ProductEditor.tsx`
- Test: `src/components/editor/RichTextEditor.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RichTextEditor from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("shows formatting controls", () => {
    render(<RichTextEditor value={null} onChange={() => {}} />);

    expect(screen.getByRole("button", { name: /heading/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /image/i })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/editor/RichTextEditor.test.tsx
```

Expected: FAIL because the editor component does not exist.

**Step 3: Write minimal implementation**

- Wrap TipTap in a reusable editor component
- Add toolbar buttons for:
  - heading
  - paragraph
  - quote
  - code block
  - link
  - image upload
- Add `storage.ts` helper for uploading files to Supabase Storage

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/editor/RichTextEditor.test.tsx
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/editor src/lib/storage.ts src/pages/admin/PostEditor.tsx src/pages/admin/ProductEditor.tsx
git commit -m "feat: add rich text editor and uploads"
```

### Task 7: Switch Public Pages to Supabase Content

**Files:**
- Create: `src/lib/repositories/publicContent.ts`
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/Post.tsx`
- Modify: `src/pages/Product.tsx`
- Modify: `src/data/index.ts`
- Test: `src/pages/Home.test.tsx`
- Test: `src/pages/Post.test.tsx`
- Test: `src/pages/Product.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

describe("Home public content", () => {
  it("renders published sections from the repository layer", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/manifesting necessity/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/pages/Home.test.tsx
```

Expected: FAIL because public pages still read static content only.

**Step 3: Write minimal implementation**

- Add repository functions for:
  - list published posts
  - list published products
  - fetch published post by slug
  - fetch published product by slug
- Update public pages to use loading and empty states while preserving the current layout
- Keep current card layout, cover images, hover behavior, and detail styling

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/pages/Home.test.tsx src/pages/Post.test.tsx src/pages/Product.test.tsx
npm run build
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/repositories/publicContent.ts src/pages/Home.tsx src/pages/Post.tsx src/pages/Product.tsx src/data/index.ts src/pages/Home.test.tsx src/pages/Post.test.tsx src/pages/Product.test.tsx
git commit -m "feat: load public content from supabase"
```

### Task 8: Add Environment Setup and Supabase SQL

**Files:**
- Create: `.env.example`
- Create: `supabase/schema.sql`
- Create: `supabase/policies.sql`
- Modify: `README.md`

**Step 1: Write the failing setup checklist**

Document the required environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Add SQL definitions for `posts`, `products`, and storage-related policies.

**Step 2: Run verification**

Run:

```bash
npm run build
npm run lint
```

Expected: PASS, with docs and setup files present.

**Step 3: Write minimal implementation**

- add `.env.example`
- add SQL schema
- add RLS policies
- document local setup and deployment steps

**Step 4: Run verification**

Run:

```bash
npm run build
npm run lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add .env.example supabase/schema.sql supabase/policies.sql README.md
git commit -m "docs: add supabase setup and schema"
```

### Task 9: Final Verification

**Files:**
- Review: `src/App.tsx`
- Review: `src/pages/Home.tsx`
- Review: `src/pages/Post.tsx`
- Review: `src/pages/Product.tsx`
- Review: `src/pages/admin/*`

**Step 1: Run focused tests**

```bash
npm test
```

Expected: PASS.

**Step 2: Run static verification**

```bash
npm run lint
npm run build
```

Expected: PASS.

**Step 3: Run manual QA**

Verify:

- login works
- anonymous access to `/admin/posts` redirects to `/admin/login`
- create a draft post and confirm it is not public
- publish the post and confirm it appears on the home page
- upload a cover image and inline image
- create a product and confirm detail page renders

**Step 4: Commit**

```bash
git add .
git commit -m "feat: ship admin cms"
```
