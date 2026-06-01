import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductEditor from "@/pages/admin/ProductEditor";
import type { CmsProduct } from "@/types/content";

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

function makeProduct(overrides: Partial<CmsProduct>): CmsProduct {
  return {
    id: "product-1",
    slug: "product-1",
    title: "Example Product",
    excerpt: "Example product excerpt",
    date: "2026-05-02",
    coverImage: "https://example.com/product-cover.jpg",
    screenshots: ["https://example.com/shot-a.jpg"],
    content: "<p>Product body</p>",
    ctaLabel: "",
    ctaUrl: "",
    status: "draft",
    createdAt: "2026-05-02T00:00:00.000Z",
    updatedAt: "2026-05-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProductEditor", () => {
  it("formats and syncs publish date when switching products", () => {
    mockStorage();

    const firstProduct = makeProduct({
      title: "First Product",
      date: "May 2, 2026",
    });

    const secondProduct = makeProduct({
      id: "product-2",
      slug: "product-2",
      title: "Second Product",
      excerpt: "Second excerpt",
      date: "2026-04-10",
      coverImage: "https://example.com/second-cover.jpg",
      screenshots: ["https://example.com/second-shot.jpg"],
    });

    const { rerender, container } = render(<ProductEditor product={firstProduct} onSaved={vi.fn()} />);

    expect((container.querySelector('input[type="date"]') as HTMLInputElement).value).toBe("2026-05-02");

    rerender(<ProductEditor product={secondProduct} onSaved={vi.fn()} />);

    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Second Product");
    expect((container.querySelector('input[type="date"]') as HTMLInputElement).value).toBe("2026-04-10");
    expect((screen.getByAltText("Second Product") as HTMLImageElement).getAttribute("src")).toBe("https://example.com/second-cover.jpg");
  });

  it("uploads a cover image and manages screenshot gallery separately", async () => {
    mockStorage();
    const user = userEvent.setup();
    const uploadImageFn = vi.fn()
      .mockResolvedValueOnce("https://example.com/uploaded-cover.jpg")
      .mockResolvedValueOnce("https://example.com/uploaded-shot-1.jpg")
      .mockResolvedValueOnce("https://example.com/uploaded-shot-2.jpg");

    render(
      <ProductEditor
        product={makeProduct({
          coverImage: "",
          screenshots: [],
        })}
        onSaved={vi.fn()}
        uploadImageFn={uploadImageFn}
      />,
    );

    await user.upload(screen.getByLabelText("Upload cover image"), new File(["cover"], "cover.png", { type: "image/png" }));
    await user.upload(screen.getByLabelText("Upload screenshot images"), [
      new File(["shot-1"], "shot-1.png", { type: "image/png" }),
      new File(["shot-2"], "shot-2.png", { type: "image/png" }),
    ]);

    await waitFor(() => {
      expect((screen.getByAltText("Example Product") as HTMLImageElement).getAttribute("src")).toBe("https://example.com/uploaded-cover.jpg");
      expect(screen.getAllByAltText(/Screenshot \d+/i)).toHaveLength(2);
    });
  });

  it("treats CTA fields as optional and keeps success feedback after publish", async () => {
    mockStorage();
    const user = userEvent.setup();

    function Wrapper() {
      const [product, setProduct] = useState(
        makeProduct({
          status: "draft",
        }),
      );

      return <ProductEditor product={product} onSaved={setProduct} />;
    }

    render(<Wrapper />);

    await user.clear(screen.getByLabelText("CTA Label"));
    await user.clear(screen.getByLabelText("CTA URL"));
    await user.selectOptions(screen.getByRole("combobox"), "published");
    await user.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(screen.getByText("Product published.")).toBeTruthy();
    });
  });
});
