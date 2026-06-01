import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Post from "@/pages/Post";
import { CMS_POSTS_KEY } from "@/lib/cms";
import type { CmsPost } from "@/types/content";

describe("Post page", () => {
  beforeEach(() => {
    const storage = (() => {
      const values = new Map<string, string>();
      return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: storage,
      writable: true,
      configurable: true,
    });

    const post: CmsPost = {
      id: "styled-post",
      slug: "styled-post",
      title: "Styled Post",
      excerpt: "Structured body",
      date: "May 14, 2026",
      coverImage: "https://example.com/cover.jpg",
      content:
        '<h2>Section Title</h2><h3>Subheading</h3><p style="text-align:center"><strong>Centered</strong> <u>statement</u> with <a href="https://example.com/resource">resource link</a>.</p><blockquote><p>Quoted text</p></blockquote><pre><code>const value = 1;</code></pre><ul><li>First bullet</li></ul><ol><li>First step</li></ol><p><img src="https://example.com/body.jpg" alt="Body image" /></p>',
      status: "published",
      authorName: "Guotao Tao",
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z",
    };

    window.localStorage.setItem(CMS_POSTS_KEY, JSON.stringify([post]));
  });

  it("renders a published post from the content layer", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/post/styled-post"]}>
        <Routes>
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain("Styled Post");
    expect(html).toContain("Guotao Tao");
    expect(html).toContain("May 14, 2026");
    expect(html).toContain("content-surface");
    expect(html).toContain("Section Title");
    expect(html).toContain("Quoted text");
    expect(html).toContain("First bullet");
    expect(html).toContain("text-align:center");
    expect(html).toContain("resource link");
    expect(html).toContain('href="https://example.com/resource"');
    expect(html).toContain("<u>statement</u>");
  });
});
