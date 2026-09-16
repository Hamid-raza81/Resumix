import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useInterview } from "../hooks/useInterview";
import { useAuth } from "../../auth/hooks/useAuth";

export default function Home() {
  const { loading, generateReport } = useInterview();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const resumeRef = useRef(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const file = resumeRef.current?.files?.[0];
    if (!file) return setError("Please select your resume PDF.");
    if (file.type !== "application/pdf") return setError("Resume must be a PDF.");
    if (!jobDescription.trim()) return setError("Please paste the job description.");
    try {
      const report = await generateReport({ jobDescription, selfDescription, resumeFile: file });
      navigate(`/interview/${report._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Could not generate the report.");
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-6 text-white">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div><h1 className="text-3xl font-black bg-linear-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Resumix AI</h1><p className="text-sm text-slate-400">Hi, {user?.username}</p></div>
        <button onClick={handleLogout} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Logout</button>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold">Job Description</h2>
          <p className="mt-2 text-sm text-slate-400">Paste the complete job description you are targeting.</p>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="mt-5 min-h-105 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none focus:border-cyan-400" placeholder="Paste job description..." />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <p className="mt-2 text-sm text-slate-400">Upload a text-based PDF resume and tell the AI a little about you.</p>
          <label className="mt-6 block text-sm text-slate-300">Resume PDF</label>
          <input ref={resumeRef} type="file" accept="application/pdf,.pdf" className="mt-2 block w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm" />
          <label className="mt-6 block text-sm text-slate-300">Self description</label>
          <textarea value={selfDescription} onChange={(e) => setSelfDescription(e.target.value)} className="mt-2 min-h-40 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none focus:border-cyan-400" placeholder="Your skills, experience, projects, goals..." />
          {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading} onClick={submit} className="mt-6 w-full rounded-2xl bg-linear-to-r from-indigo-600 via-violet-600 to-cyan-500 py-3.5 font-bold disabled:opacity-50">{loading ? "Analyzing resume..." : "Generate Interview Report"}</button>
        </section>
      </div>
    </main>
  );
}
