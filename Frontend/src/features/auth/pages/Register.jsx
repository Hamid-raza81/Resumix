import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await handleRegister(form);
    if (result.ok) navigate("/", { replace: true });
    else setError(result.message);
  };

  return (
    <main className="min-h-screen grid place-items-center bg-linear-to-br from-slate-950 via-slate-900 to-black p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-slate-400">Start preparing smarter with Resumix.</p>
        {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <input required minLength={3} placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-6 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" />
        <input required minLength={6} type="password" placeholder="Password (6+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-4 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" />
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-linear-to-r from-indigo-600 to-cyan-500 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Creating..." : "Create account"}</button>
        <p className="mt-5 text-center text-sm text-slate-400">Already registered? <Link className="text-cyan-300" to="/login">Sign in</Link></p>
      </form>
    </main>
  );
}
