"use client";

import {
  ArrowRight,
  Brain,
  Database,
  FileText,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(120,119,198,0.14),transparent_26%)]" />

      <section className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300">
            <Sparkles size={16} />
            AI-Powered Technical Interview Platform
          </div>

          <h1 className="mb-8 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            Resume Intelligence
            <span className="block text-zinc-500">
              + Dynamic AI Interviews
            </span>
          </h1>

          <p className="mb-10 max-w-3xl text-lg leading-9 text-zinc-400">
            Upload resumes, extract candidate context, generate grounded
            interview questions, and evaluate technical answers in one focused
            screening workflow.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/upload";
            }}
            className="inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 text-lg font-semibold text-black transition hover:opacity-90"
          >
            Start AI Interview
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-2">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <FileText size={28} />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            Resume Intelligence
          </h2>
          <p className="leading-8 text-zinc-400">
            Parse resumes into usable interview context with extracted skills,
            projects, and candidate-specific technical signals.
          </p>
        </div>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Database size={28} />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            RAG Retrieval
          </h2>
          <p className="leading-8 text-zinc-400">
            Use semantic retrieval to ground question generation in relevant
            project and technical context instead of generic prompts.
          </p>
        </div>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Brain size={28} />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            Interview Engine
          </h2>
          <p className="leading-8 text-zinc-400">
            Generate coherent conceptual, implementation, and system-design
            questions tuned to the candidate profile.
          </p>
        </div>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Sparkles size={28} />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            AI Evaluation
          </h2>
          <p className="leading-8 text-zinc-400">
            Review candidate answers with structured feedback for technical
            depth, clarity, and overall response quality.
          </p>
        </div>
      </section>
    </main>
  );
}
