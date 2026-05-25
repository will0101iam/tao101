import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Home from "@/pages/Home";

describe("homepage", () => {
  it("renders the editorial landing structure", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(html).toContain("Work Less.");
    expect(html).toContain("RESOURCES");
    expect(html).toContain("THE BLOG");
    expect(html).toContain("Build一个Claude Code-01：CircleLoop");
    expect(html).toContain("Who Is");
    expect(html).toContain("Gain A New Perspective");
  });
});
