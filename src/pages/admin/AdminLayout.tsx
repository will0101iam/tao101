import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AdminAuthContext } from "@/context/AdminAuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 border transition-colors ${isActive ? "border-white text-white" : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"}`;

export default function AdminLayout() {
  const { session, signOut, mode } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-black text-[#e8e8e8]">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between gap-6">
          <div>
            <p className="font-['Montserrat'] text-[12px] tracking-[8px] uppercase text-white/60 mb-2">Admin</p>
            <h1 className="font-['Poppins'] text-[28px] font-[900] leading-none">Content Console</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">{session?.email}</p>
            <p className="text-xs uppercase tracking-[4px] text-white/40">{mode} mode</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <NavLink to="/admin/posts" className={linkClass}>Posts</NavLink>
          <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
          <button onClick={handleSignOut} className="ml-auto px-4 py-2 border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors">Sign Out</button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
