import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostEditor from "@/pages/admin/PostEditor";
import type { CmsPost } from "@/types/content";

afterEach(() => {
  cleanup();
});

function mockStorage() {
  vi.stubEnv("VITE_SUPABASE_URL", "");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

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
}

function makePost(overrides: Partial<CmsPost>): CmsPost {
  return {
    id: "post-1",
    slug: "post-1",
    title: "Example Post",
    excerpt: "Example excerpt",
    date: "2026-05-02",
    coverImage: "https://example.com/cover.jpg",
    content: "<p>Hello</p>",
    status: "published",
    authorName: "Guotao Tao",
    createdAt: "2026-05-02T00:00:00.000Z",
    updatedAt: "2026-05-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("PostEditor", () => {
  it("submits title and excerpt", async () => {
    mockStorage();

    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(<PostEditor onSaved={onSaved} />);

    await user.type(screen.getByLabelText("Title"), "My First Post");
    await user.type(screen.getByLabelText("Excerpt"), "A short summary");
    await user.click(screen.getByRole("button", { name: "Save Draft" }));

    expect(onSaved).toHaveBeenCalled();
  });

  it("syncs editor fields when switching to another post", () => {
    mockStorage();
    const firstPost = makePost({
      id: "post-1",
      slug: "post-1",
      title: "First Post",
      excerpt: "First excerpt",
      date: "2026-05-02",
      coverImage: "https://example.com/first.jpg",
      content: "<p>First body</p>",
    });
    const secondPost = makePost({
      id: "post-2",
      slug: "post-2",
      title: "Second Post",
      excerpt: "Second excerpt",
      date: "2026-04-10",
      coverImage: "https://example.com/second.jpg",
      content: "<p>Second body</p>",
    });

    const { rerender, container } = render(<PostEditor post={firstPost} onSaved={vi.fn()} />);
    rerender(<PostEditor post={secondPost} onSaved={vi.fn()} />);

    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Second Post");
    expect((screen.getByLabelText("Excerpt") as HTMLTextAreaElement).value).toBe("Second excerpt");
    expect((container.querySelector('input[type="date"]') as HTMLInputElement).value).toBe("2026-04-10");
    expect((screen.getByAltText("Second Post") as HTMLImageElement).getAttribute("src")).toBe("https://example.com/second.jpg");
  });

  it("formats natural language dates for the publish date input", () => {
    mockStorage();
    const { container } = render(
      <PostEditor
        post={makePost({
          date: "May 2, 2026",
        })}
        onSaved={vi.fn()}
      />,
    );

    expect((container.querySelector('input[type="date"]') as HTMLInputElement).value).toBe("2026-05-02");
  });

  it("shows helper copy that separates cover and body images", () => {
    mockStorage();

    render(<PostEditor post={makePost({ content: '<p><img src="https://example.com/body.jpg" /></p>' })} onSaved={vi.fn()} />);

    expect(screen.getByText("Cover image is the top hero image. Body images stay in the editor content below.")).toBeTruthy();
  });

  it("shows selectable body image candidates for the cover", async () => {
    mockStorage();
    const user = userEvent.setup();

    render(
      <PostEditor
        post={makePost({
          coverImage: "",
          content:
            '<p><img src="https://example.com/body-a.jpg" /></p><p><img src="https://example.com/body-a.jpg" /></p><p><img src="https://example.com/body-b.jpg" /></p>',
        })}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "From Article" })).toBeNull();
    expect(screen.getByText("Select a cover from images already used in the article body.")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Use body image/i })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Use body image 2 as cover" }));

    await waitFor(() => {
      expect((screen.getByAltText("Example Post") as HTMLImageElement).getAttribute("src")).toBe("https://example.com/body-b.jpg");
    });
  });

  it("uploads a cover image", async () => {
    mockStorage();
    const user = userEvent.setup();
    const uploadImageFn = vi.fn().mockResolvedValue("https://example.com/uploaded-cover.jpg");

    render(<PostEditor post={makePost({ coverImage: "" })} onSaved={vi.fn()} uploadImageFn={uploadImageFn} />);

    const fileInput = screen.getByLabelText("Upload cover image") as HTMLInputElement;
    const file = new File(["cover"], "cover.png", { type: "image/png" });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(uploadImageFn).toHaveBeenCalledTimes(1);
      expect((screen.getByAltText("Example Post") as HTMLImageElement).getAttribute("src")).toBe("https://example.com/uploaded-cover.jpg");
    });
  });

  it("shows a success message after publishing", async () => {
    mockStorage();
    const user = userEvent.setup();

    render(
      <PostEditor
        post={makePost({
          status: "draft",
        })}
        onSaved={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "published");
    await user.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(screen.getByText("Post published.")).toBeTruthy();
    });
  });

  it("keeps the success message visible when parent syncs the saved post back into the editor", async () => {
    mockStorage();
    const user = userEvent.setup();

    function Wrapper() {
      const [post, setPost] = useState(
        makePost({
          status: "draft",
        }),
      );

      return <PostEditor post={post} onSaved={setPost} />;
    }

    render(<Wrapper />);

    await user.selectOptions(screen.getByRole("combobox"), "published");
    await user.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(screen.getByText("Post published.")).toBeTruthy();
    });
  });
});
