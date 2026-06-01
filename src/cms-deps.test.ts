import { describe, expect, it } from "vitest";

describe("cms dependencies", () => {
  it("loads supabase and editor packages", async () => {
    const supabase = await import("@supabase/supabase-js");
    const tiptapReact = await import("@tiptap/react");

    expect(typeof supabase.createClient).toBe("function");
    expect(tiptapReact.EditorContent).toBeDefined();
  });
});
