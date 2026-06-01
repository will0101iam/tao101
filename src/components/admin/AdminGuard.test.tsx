import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminGuard from "@/components/admin/AdminGuard";
import { AdminAuthContext } from "@/context/AdminAuthContext";

describe("AdminGuard", () => {
  it("redirects anonymous users to the login page", () => {
    render(
      <AdminAuthContext.Provider
        value={{
          ready: true,
          session: null,
          mode: "local",
          signIn: async () => ({ email: "demo@example.com", mode: "local" }),
          signOut: async () => {},
          refreshSession: async () => null,
        }}
      >
        <MemoryRouter initialEntries={["/admin/posts"]}>
          <Routes>
            <Route path="/admin/login" element={<div>login screen</div>} />
            <Route
              path="/admin/posts"
              element={
                <AdminGuard>
                  <div>secret screen</div>
                </AdminGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      </AdminAuthContext.Provider>,
    );

    expect(screen.getByText("login screen")).toBeTruthy();
  });
});
