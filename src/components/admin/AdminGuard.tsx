import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AdminAuthContext } from "@/context/AdminAuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { ready, session } = useContext(AdminAuthContext);
  const location = useLocation();

  if (!ready) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading admin…</div>;
  }

  if (!session) {
    return <Navigate replace to="/admin/login" state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
