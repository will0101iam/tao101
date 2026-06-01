import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import PostList from "@/pages/admin/PostList";
import ProductList from "@/pages/admin/ProductList";

vi.mock("@/pages/admin/PostEditor", () => ({
  default: () => <div>post editor mock</div>,
}));

vi.mock("@/pages/admin/ProductEditor", () => ({
  default: () => <div>product editor mock</div>,
}));

vi.mock("@/lib/cms", () => ({
  listPosts: vi.fn(async () => [
    {
      id: "post-1",
      slug: "post-1",
      title: "Newest Post",
      excerpt: "newest excerpt",
      date: "2026-05-20",
      coverImage: "",
      content: "<p>post</p>",
      status: "published",
      authorName: "Guotao Tao",
      createdAt: "2026-05-20T00:00:00.000Z",
      updatedAt: "2026-05-20T00:00:00.000Z",
    },
  ]),
  getAdminPosts: vi.fn(() => []),
  deletePost: vi.fn(async () => {}),
  listProducts: vi.fn(async () => [
    {
      id: "product-1",
      slug: "product-1",
      title: "Newest Product",
      excerpt: "newest excerpt",
      date: "2026-05-20",
      coverImage: "",
      screenshots: [],
      content: "<p>product</p>",
      ctaLabel: "",
      ctaUrl: "",
      status: "published",
      createdAt: "2026-05-20T00:00:00.000Z",
      updatedAt: "2026-05-20T00:00:00.000Z",
    },
  ]),
  getAdminProducts: vi.fn(() => []),
  deleteProduct: vi.fn(async () => {}),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});

describe("Admin list layout", () => {
  it("renders a scrollable post list shell", async () => {
    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText("Newest Post")).toBeTruthy();
    });

    const listColumn = screen.getByTestId("admin-list-column");
    const listShell = screen.getByTestId("admin-list-shell");
    const scrollArea = screen.getByTestId("admin-list-scroll");
    const editorColumn = screen.getByTestId("admin-editor-column");

    expect(listColumn.className).toContain("lg:self-start");
    expect(listColumn.className).not.toContain("sticky");
    expect(listShell.className).toContain("overflow-hidden");
    expect(scrollArea.className).toContain("h-full");
    expect(scrollArea.className).toContain("overflow-y-auto");
    expect(editorColumn).toBeTruthy();
  });

  it("renders a scrollable product list shell", async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Newest Product")).toBeTruthy();
    });

    const listColumn = screen.getByTestId("admin-list-column");
    const listShell = screen.getByTestId("admin-list-shell");
    const scrollArea = screen.getByTestId("admin-list-scroll");
    const editorColumn = screen.getByTestId("admin-editor-column");

    expect(listColumn.className).toContain("lg:self-start");
    expect(listColumn.className).not.toContain("sticky");
    expect(listShell.className).toContain("overflow-hidden");
    expect(scrollArea.className).toContain("h-full");
    expect(scrollArea.className).toContain("overflow-y-auto");
    expect(editorColumn).toBeTruthy();
  });
});
