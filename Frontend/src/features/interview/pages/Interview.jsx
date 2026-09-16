import { useState } from "react";
import { Link } from "react-router";
import { useInterview } from "../hooks/useInterview";

const tabs = ["technical", "behavioral", "roadmap", "gaps"];

export default function Interview() {
  const { report, loading, downloadResume } = useInterview();
  const [tab, setTab] = useState("technical");
  const [expanded, setExpanded] = useState({});
  const [downloadError, setDownloadError] = useState("");

  if (loading && !report) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Loading report...</div>;
  if (!report) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Report not found.</div>;

  const technical = report.technicalQuestions || [];
  const behavioral = report.behavioralQuestions || [];
  const roadmap = report.preparationPlan || [];
  const gaps = report.skillGaps || [];
  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black p-4 text-white md:p-6">
      <header className="mx-auto mb-6 flex max-w-7xl items-center justify-between gap-4">
        <div><Link to="/" className="text-sm text-cyan-300">← New analysis</Link><h1 className="mt-2 text-2xl font-bold md:text-4xl">{report.title}</h1></div>
        <div className="text-right">
          <button
            disabled={loading}
            onClick={async () => {
              setDownloadError("");
              try {
                await downloadResume(report._id);
              } catch (error) {
                setDownloadError(error.message || "Could not download the tailored resume.");
              }
            }}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            {loading ? "Preparing PDF..." : "Download tailored PDF"}
          </button>
          {downloadError && <p className="mt-2 max-w-xs text-xs text-red-300">{downloadError}</p>}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[220px_1fr_240px]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4">
          {tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`mb-2 w-full rounded-xl border p-3 text-left capitalize ${tab === item ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-slate-300 hover:bg-white/5"}`}>{item}</button>)}
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          {tab === "technical" && <QuestionList items={technical} color="cyan" expanded={expanded} toggle={toggle} prefix="t" />}
          {tab === "behavioral" && <QuestionList items={behavioral} color="violet" expanded={expanded} toggle={toggle} prefix="b" />}
          {tab === "roadmap" && <div className="space-y-3">{roadmap.map((item) => <div key={item.day} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="font-bold text-cyan-300">Day {item.day}: {item.focus}</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{item.tasks.map((task, i) => <li key={i}>{task}</li>)}</ul></div>)}</div>}
          {tab === "gaps" && <div className="grid gap-3 sm:grid-cols-2">{gaps.length ? gaps.map((gap) => <div key={gap.skill} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="font-semibold">{gap.skill}</p><p className={`mt-1 text-sm capitalize ${gap.severity === "high" ? "text-red-300" : gap.severity === "medium" ? "text-amber-300" : "text-emerald-300"}`}>{gap.severity} priority</p></div>) : <p className="text-slate-400">No significant skill gaps were detected.</p>}</div>}
        </section>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Resume / JD match</p>
          <p className="mt-2 text-6xl font-black text-cyan-300">{report.matchScore}<span className="text-2xl">%</span></p>
          <div className="mt-6 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-linear-to-r from-cyan-400 to-violet-500" style={{ width: `${report.matchScore}%` }} /></div>
          <p className="mt-6 text-xs text-slate-500">Generated from your uploaded resume, self-description and job description.</p>
        </aside>
      </div>
    </main>
  );
}

function QuestionList({ items, expanded, toggle, prefix }) {
  return <div className="space-y-3">{items.map((item, index) => { const key = `${prefix}-${index}`; return <div key={key} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50"><button onClick={() => toggle(key)} className="flex w-full items-start justify-between gap-4 p-4 text-left"><span><span className="text-slate-500">{index + 1}. </span>{item.question}</span><span className="text-xl text-cyan-300">{expanded[key] ? "−" : "+"}</span></button>{expanded[key] && <div className="border-t border-white/10 p-4 text-sm text-slate-300"><p><b className="text-cyan-300">Why asked:</b> {item.intention}</p><p className="mt-3"><b className="text-cyan-300">How to answer:</b> {item.answer}</p></div>}</div>; })}</div>;
}
