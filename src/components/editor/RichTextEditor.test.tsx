import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RichTextEditor from "@/components/editor/RichTextEditor";

describe("RichTextEditor", () => {
  it("shows formatting controls", () => {
    render(
      <RichTextEditor
        value="<p>Hello</p>"
        onChange={vi.fn()}
        onImageUpload={async () => "https://example.com/image.jpg"}
      />,
    );

    expect(screen.getByRole("button", { name: "Paragraph" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Heading 2" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Heading 3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bold" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Italic" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Underline" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Quote" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Code Block" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bullet List" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ordered List" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Align Left" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Align Center" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Link" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Link" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Insert Image" })).toBeTruthy();
    expect(screen.getByTitle("Bold")).toBeTruthy();
    expect(screen.getByTitle("Align Center")).toBeTruthy();
  });

  it("renders existing structured content inside the editor", () => {
    const { container } = render(
      <RichTextEditor
        value={`
          <h2>Section Title</h2>
          <h3>Subheading</h3>
          <p><strong>Bold text</strong> with <em>italic text</em> and <u>underlined text</u>.</p>
          <blockquote><p>Quoted text</p></blockquote>
          <pre><code>const value = 1;</code></pre>
          <ul><li>First bullet</li></ul>
          <ol><li>First step</li></ol>
          <p style="text-align:center">Centered paragraph</p>
          <p><a href="https://example.com/resource">Linked resource</a></p>
          <p><img src="https://example.com/image.jpg" alt="Example" /></p>
        `}
        onChange={vi.fn()}
        onImageUpload={async () => "https://example.com/image.jpg"}
      />,
    );

    expect(container.querySelector(".editor-content")).toBeTruthy();
    expect(container.querySelector(".ProseMirror h2")?.textContent).toContain("Section Title");
    expect(container.querySelector(".ProseMirror h3")?.textContent).toContain("Subheading");
    expect(container.querySelector(".ProseMirror blockquote")?.textContent).toContain("Quoted text");
    expect(container.querySelector(".ProseMirror pre code")?.textContent).toContain("const value = 1;");
    expect(container.querySelectorAll(".ProseMirror ul li")).toHaveLength(1);
    expect(container.querySelectorAll(".ProseMirror ol li")).toHaveLength(1);
    expect(container.querySelector(".ProseMirror strong")?.textContent).toContain("Bold text");
    expect(container.querySelector(".ProseMirror em")?.textContent).toContain("italic text");
    expect(container.querySelector(".ProseMirror u")?.textContent).toContain("underlined text");
    expect(container.querySelector('.ProseMirror a[href="https://example.com/resource"]')?.textContent).toContain("Linked resource");
    const image = container.querySelector('.ProseMirror img[src="https://example.com/image.jpg"]');
    expect(image).toBeTruthy();
    expect(image?.getAttribute("class")).toContain("editor-inline-image");
  });

  it("keeps the toolbar separate from the scrollable editor body", () => {
    const { container } = render(
      <RichTextEditor
        value="<p>Hello</p>"
        onChange={vi.fn()}
        onImageUpload={async () => "https://example.com/image.jpg"}
      />,
    );

    expect(container.querySelector(".editor-frame")).toBeTruthy();
    expect(container.querySelector(".editor-toolbar-shell")).toBeTruthy();
    expect(container.querySelector(".editor-scroll-region")).toBeTruthy();
    expect(container.querySelector(".editor-content-shell")).toBeTruthy();
    expect(container.querySelector(".editor-content")?.getAttribute("class")).toContain("editor-prosemirror");
  });
});
