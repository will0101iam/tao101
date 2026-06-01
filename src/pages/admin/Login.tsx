import { FormEvent, useContext, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AdminAuthContext } from "@/context/AdminAuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signIn, mode } = useContext(AdminAuthContext);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = (location.state as { from?: string } | null)?.from ?? "/admin/posts";

  if (session) {
    return <Navigate replace to={nextPath} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await signIn(email, password);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#e8e8e8] flex items-center justify-center px-6">
      <div className="w-full max-w-[460px] border border-white/10 bg-[#050505] p-8">
        <p className="font-['Montserrat'] text-[14px] tracking-[8px] uppercase mb-4">Admin</p>
        <h1 className="font-['Poppins'] text-[40px] font-[900] leading-none mb-4">Edit The Site</h1>
        <p className="text-[16px] leading-7 text-white/70 mb-8">
          {mode === "local" ? "Local mode is active right now. Once Supabase is configured, this login will use real authentication." : "Sign in to manage posts and products."}
        </p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="block mb-2 text-white/70">Email</span>
            <input className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="block mb-2 text-white/70">Password</span>
            <input type="password" className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="text-sm text-[#ff9d9d]">{error}</p> : null}
          <button type="submit" disabled={submitting} className="w-full bg-[#efefef] text-black px-4 py-3 font-['Poppins'] font-[700] hover:bg-[#e0c787] transition-colors disabled:opacity-60">
            {submitting ? "Signing In…" : "Enter Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
