import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Product from "@/pages/Product";

describe("Product page", () => {
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
  });

  it("renders a published product from the content layer", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/product/zen-terminal"]}>
        <Routes>
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain("Zen Terminal");
    expect(html).toContain("the command line, silenced.");
    expect(html).toContain("May 12, 2026");
    expect(html).toContain("Screenshot 1");
    expect(html).not.toContain("Access Repository");
  });
});
