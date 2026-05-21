"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  AlertTriangle,
  BadgeCheck,
  Brain,
  Cpu,
  FileText,
  Gauge,
  Sparkles,
  TrendingUp,
  Workflow,
} from "lucide-react";

import api from "@/services/api";

interface ParsedData {
  skills: string[];
  projects: string[];
  raw_text: string;
}

interface UploadResponse {
  filename: string;
  parsed_data: ParsedData;
}

interface ParsedEvaluation {
  improvement: string[];
  rawMarkdown: string;
  scoreLabel: string | null;
  scoreValue: number | null;
  strengths: string[];
  summary: string[];
  weaknesses: string[];
}

interface EvaluationResponse {
  evaluation: string;
  parsed_evaluation?: ParsedEvaluation;
}

const cleanQuestion = (
  question: string
) =>
  question
    .replace(
      /^\s*\d+[\.\)]\s*/,
      ""
    )
    .replace(
      /^\s*[-*]\s*/,
      ""
    )
    .trim();

const normalizeQuestions = (
  rawQuestions: unknown
) => {
  if (
    Array.isArray(
      rawQuestions
    )
  ) {
    return rawQuestions
      .filter(
        (
          question
        ): question is string =>
          typeof question ===
          "string"
      )
      .map(cleanQuestion)
      .filter(
        (question) =>
          question.length > 10
      )
      .slice(0, 3);
  }

  if (
    typeof rawQuestions !==
    "string"
  ) {
    return [];
  }

  return rawQuestions
    .split(/\n+/)
    .map(cleanQuestion)
    .filter(
      (question) =>
        question.length > 10
    )
    .slice(0, 3);
};

const cleanEvaluationLine = (
  line: string
) =>
  line
    .replace(
      /^[-*]\s*/,
      ""
    )
    .replace(
      /^\d+[\.\)]\s*/,
      ""
    )
    .replace(
      /\*\*/g,
      ""
    )
    .trim();

const parseEvaluation = (
  rawEvaluation: string
): ParsedEvaluation => {
  const scoreMatch =
    rawEvaluation.match(
      /(\d+(?:\.\d+)?)\s*\/\s*10/
    );

  const scoreValue = scoreMatch
    ? Number(scoreMatch[1])
    : null;

  const lines =
    rawEvaluation
      .split(/\r?\n/)
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

  const summary: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvement: string[] = [];

  let currentSection:
    | "summary"
    | "strengths"
    | "weaknesses"
    | "improvement" =
    "summary";

  for (const line of lines) {
    const normalized =
      line
        .toLowerCase()
        .replace(
          /[*:#]/g,
          ""
        )
        .trim();

    if (
      normalized.includes("strength")
    ) {
      currentSection =
        "strengths";
      continue;
    }

    if (
      normalized.includes("weakness")
    ) {
      currentSection =
        "weaknesses";
      continue;
    }

    if (
      normalized.includes(
        "suggested improvement"
      ) ||
      normalized ===
        "improvement" ||
      normalized.startsWith(
        "improvement "
      )
    ) {
      currentSection =
        "improvement";
      continue;
    }

    if (
      normalized.includes("score") &&
      normalized.includes("/10")
    ) {
      continue;
    }

    const cleaned =
      cleanEvaluationLine(line);

    if (!cleaned) {
      continue;
    }

    if (
      currentSection ===
      "summary"
    ) {
      summary.push(cleaned);
    }

    if (
      currentSection ===
      "strengths"
    ) {
      strengths.push(cleaned);
    }

    if (
      currentSection ===
      "weaknesses"
    ) {
      weaknesses.push(cleaned);
    }

    if (
      currentSection ===
      "improvement"
    ) {
      improvement.push(cleaned);
    }
  }

  return {
    improvement,
    rawMarkdown: rawEvaluation,
    scoreLabel: scoreMatch
      ? `${scoreMatch[1]}/10`
      : null,
    scoreValue,
    strengths,
    summary,
    weaknesses,
  };
};

const scoreTone = (
  score: number | null
) => {
  if (score === null) {
    return "border-zinc-700 bg-zinc-900 text-zinc-200";
  }

  if (score >= 8) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }

  if (score >= 6) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }

  return "border-red-500/40 bg-red-500/10 text-red-300";
};

export default function ResumeUpload() {
  const [file, setFile] =
    useState<File | null>(null);
  const [loading, setLoading] =
    useState(false);
  const [evaluating, setEvaluating] =
    useState<Record<number, boolean>>({});
  const [result, setResult] =
    useState<UploadResponse | null>(null);
  const [questions, setQuestions] =
    useState<string[]>([]);
  const [answers, setAnswers] =
    useState<Record<number, string>>({});
  const [evaluations, setEvaluations] =
    useState<Record<number, string>>({});
  const [evaluationDetails, setEvaluationDetails] =
    useState<Record<number, ParsedEvaluation>>(
      {}
    );
  const [selectedRole, setSelectedRole] =
    useState("AI/ML Engineer");
  const [error, setError] =
    useState("");
  const analysisRef =
    useRef<HTMLElement | null>(null);
  const interviewRef =
    useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (
      questions.length > 0 &&
      interviewRef.current
    ) {
      interviewRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    if (
      result &&
      analysisRef.current
    ) {
      analysisRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [questions, result]);

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please select a PDF."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setQuestions([]);
      setEvaluations({});
      setEvaluationDetails({});

      const formData = new FormData();
      formData.append(
        "file",
        file
      );

      const uploadResponse =
        await api.post(
          "/upload",
          formData
        );

      const parsedData =
        uploadResponse.data;

      setResult(parsedData);

      const questionResponse =
        await api.post(
          "/generate-questions",
          {
            role: selectedRole,
            skills:
              parsedData
                .parsed_data
                .skills,
            projects:
              parsedData
                .parsed_data
                .projects,
            raw_text:
              parsedData
                .parsed_data
                .raw_text,
          }
        );

      const rawQuestions =
        questionResponse
          .data
          .questions;

      setQuestions(
        normalizeQuestions(
          rawQuestions
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Failed to generate interview."
      );
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async (
    index: number,
    question: string
  ) => {
    try {
      const answer =
        answers[index];

      if (!answer) {
        alert(
          "Please enter an answer."
        );
        return;
      }

      setEvaluating((prev) => ({
        ...prev,
        [index]: true,
      }));

      const response =
        await api.post<EvaluationResponse>(
          "/evaluate",
          {
            question,
            answer,
          }
        );

      const parsedEvaluation =
        response.data
          .parsed_evaluation ??
        parseEvaluation(
          response.data.evaluation
        );

      setEvaluations((prev) => ({
        ...prev,
        [index]:
          response.data.evaluation,
      }));

      setEvaluationDetails(
        (prev) => ({
          ...prev,
          [index]:
            parsedEvaluation,
        })
      );
    } catch (err) {
      console.error(err);
      alert("Evaluation failed.");
    } finally {
      setEvaluating((prev) => ({
        ...prev,
        [index]: false,
      }));
    }
  };

  return (
    <div className="flex w-full max-w-6xl flex-col gap-10">
      <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/75 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(120,119,198,0.12),transparent_24%)]" />

        <div className="relative grid gap-10 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300">
              <Sparkles size={16} />
              AI-Powered Technical Interview Platform
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-[0.95] text-white md:text-6xl">
                <span className="block">
                  Resume Intelligence
                </span>
                <span className="mt-2 block text-zinc-500 md:mt-3">
                  + Dynamic AI Interviews
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
                Upload a resume, extract the candidate&apos;s strongest technical
                signals, and generate a role-aware interview loop built for
                practical screening.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-5">
                <FileText className="mb-4 text-white" size={24} />
                <p className="mb-2 text-lg font-semibold text-white">
                  Resume Parsing
                </p>
                <p className="text-sm leading-6 text-zinc-400">
                  Extract skills, projects, and structured candidate context.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-5">
                <Brain className="mb-4 text-white" size={24} />
                <p className="mb-2 text-lg font-semibold text-white">
                  Focused Questions
                </p>
                <p className="text-sm leading-6 text-zinc-400">
                  Generate interview prompts that stay aligned with the resume.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-5">
                <Workflow className="mb-4 text-white" size={24} />
                <p className="mb-2 text-lg font-semibold text-white">
                  Evaluation Loop
                </p>
                <p className="text-sm leading-6 text-zinc-400">
                  Review candidate answers with structured AI feedback.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-zinc-800 bg-black/60 p-6 md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-black">
                <Cpu size={24} />
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                  Interview Setup
                </p>
                <p className="text-xl font-semibold text-white">
                  Configure the screening flow
                </p>
              </div>
            </div>

            <ol className="mb-6 grid gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500 sm:grid-cols-3">
              <li className="rounded-full border border-zinc-800 px-3 py-2 text-center">
                1. Select role
              </li>
              <li className="rounded-full border border-zinc-800 px-3 py-2 text-center">
                2. Upload PDF
              </li>
              <li className="rounded-full border border-zinc-800 px-3 py-2 text-center">
                3. Generate interview
              </li>
            </ol>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Select Role
                </label>

                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-white transition focus:border-zinc-600"
                >
                  <option>
                    AI/ML Engineer
                  </option>
                  <option>
                    Backend Engineer
                  </option>
                  <option>
                    Data Scientist
                  </option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-zinc-400">
                  Resume PDF
                </label>

                <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-5">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (
                        e.target.files?.[0]
                      ) {
                        setFile(
                          e.target.files[0]
                        );
                      }
                    }}
                    className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-3 file:font-semibold file:text-black hover:file:opacity-90"
                  />

                  <p className="mt-4 text-sm leading-6 text-zinc-500">
                    Best for resumes with clear project descriptions and skill sections.
                  </p>
                </div>

                {file && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm leading-6 text-zinc-300">
                    Selected file:{" "}
                    <span className="font-medium text-white">
                      {file.name}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full rounded-2xl bg-white px-6 py-4 text-base font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Generating Interview..."
                  : "Start AI Interview"}
              </button>

              {error && (
                <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {result && (
        <section
          ref={analysisRef}
          className="rounded-[2rem] border border-zinc-800 bg-zinc-950/75 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] md:p-8"
        >
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                Candidate Analysis
              </p>
              <h2 className="text-3xl font-bold text-white">
                Resume signals extracted for interview generation
              </h2>
            </div>

            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-400">
              Role track: {selectedRole}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/40 p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.18em] text-zinc-500">
                Detected Skills
              </p>

              <ul className="flex flex-wrap gap-3">
                {result.parsed_data.skills.map(
                  (
                    skill,
                    index
                  ) => (
                    <li
                      key={index}
                      className="rounded-full border border-zinc-700 bg-white px-4 py-2 text-sm font-medium text-black"
                    >
                      {skill}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/40 p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.18em] text-zinc-500">
                Projects
              </p>

              <div className="space-y-3 text-zinc-300">
                {result.parsed_data.projects.map(
                  (
                    project,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-4 leading-7"
                    >
                      {project}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {questions.length > 0 && (
        <section
          ref={interviewRef}
          className="space-y-6"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                AI Interview
              </p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Interview workspace
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              Move through the questions in order, capture the candidate&apos;s answer,
              and use AI evaluation to review technical depth and clarity.
            </p>
          </div>

          <div className="grid gap-6">
            {questions.map(
              (
                question,
                index
              ) => (
                <article
                  key={index}
                  className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] md:p-7"
                >
                  {(() => {
                    const parsedEvaluation =
                      evaluationDetails[
                        index
                      ] ??
                      (evaluations[index]
                        ? parseEvaluation(
                            evaluations[
                              index
                            ]
                          )
                        : null);

                    return (
                      <>
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="max-w-3xl">
                            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                              Question {index + 1}
                            </p>
                            <p className="text-lg leading-8 text-white md:text-xl">
                              {question.trim()}
                            </p>
                          </div>

                          <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                            {index === 0 &&
                              "Conceptual"}
                            {index === 1 &&
                              "Implementation"}
                            {index === 2 &&
                              "System Design"}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <textarea
                            placeholder="Write your answer..."
                            value={
                              answers[index] ||
                              ""
                            }
                            onChange={(e) =>
                              setAnswers(
                                (
                                  prev
                                ) => ({
                                  ...prev,
                                  [index]:
                                    e.target
                                      .value,
                                })
                              )
                            }
                            className="min-h-[180px] w-full rounded-[1.5rem] border border-zinc-800 bg-black/70 p-5 leading-7 text-white transition placeholder:text-zinc-500 focus:border-zinc-600"
                          />

                          <button
                            onClick={() =>
                              evaluateAnswer(
                                index,
                                question
                              )
                            }
                            disabled={
                              evaluating[
                                index
                              ]
                            }
                            className="rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {evaluating[
                              index
                            ]
                              ? "Evaluating..."
                              : "Evaluate Answer"}
                          </button>

                          {parsedEvaluation && (
                            <div className="overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-black/60">
                              <div className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.92),rgba(9,9,11,0.92))] p-5 md:p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div>
                                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                                      AI Evaluation
                                    </p>
                                    <h3 className="text-2xl font-semibold text-white">
                                      Interview feedback snapshot
                                    </h3>

                                    {parsedEvaluation.summary
                                      .length >
                                      0 && (
                                      <div className="mt-4 max-w-2xl space-y-2 text-sm leading-7 text-zinc-300">
                                        {parsedEvaluation.summary.map(
                                          (
                                            line,
                                            summaryIndex
                                          ) => (
                                            <p
                                              key={
                                                summaryIndex
                                              }
                                            >
                                              {line}
                                            </p>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div
                                    className={`inline-flex min-w-[150px] flex-col rounded-[1.25rem] border px-5 py-4 ${scoreTone(
                                      parsedEvaluation.scoreValue
                                    )}`}
                                  >
                                    <span className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                                      <Gauge
                                        size={14}
                                      />
                                      Score
                                    </span>
                                    <span className="text-3xl font-bold">
                                      {parsedEvaluation.scoreLabel ??
                                        "N/A"}
                                    </span>
                                    <span className="mt-1 text-sm opacity-80">
                                      Technical interview rating
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
                                <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950/85 p-5">
                                  <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300">
                                      <BadgeCheck
                                        size={18}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        Strengths
                                      </p>
                                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                        What worked
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 text-sm leading-7 text-zinc-300">
                                    {parsedEvaluation.strengths
                                      .length >
                                    0 ? (
                                      parsedEvaluation.strengths.map(
                                        (
                                          item,
                                          itemIndex
                                        ) => (
                                          <p
                                            key={
                                              itemIndex
                                            }
                                          >
                                            {item}
                                          </p>
                                        )
                                      )
                                    ) : (
                                      <p className="text-zinc-500">
                                        No structured strengths were returned.
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950/85 p-5">
                                  <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
                                      <AlertTriangle
                                        size={18}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        Weaknesses
                                      </p>
                                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                        Gaps to address
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 text-sm leading-7 text-zinc-300">
                                    {parsedEvaluation.weaknesses
                                      .length >
                                    0 ? (
                                      parsedEvaluation.weaknesses.map(
                                        (
                                          item,
                                          itemIndex
                                        ) => (
                                          <p
                                            key={
                                              itemIndex
                                            }
                                          >
                                            {item}
                                          </p>
                                        )
                                      )
                                    ) : (
                                      <p className="text-zinc-500">
                                        No structured weaknesses were returned.
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950/85 p-5">
                                  <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 text-sky-300">
                                      <TrendingUp
                                        size={18}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        Improvement
                                      </p>
                                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                        Next step
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 text-sm leading-7 text-zinc-300">
                                    {parsedEvaluation.improvement
                                      .length >
                                    0 ? (
                                      parsedEvaluation.improvement.map(
                                        (
                                          item,
                                          itemIndex
                                        ) => (
                                          <p
                                            key={
                                              itemIndex
                                            }
                                          >
                                            {item}
                                          </p>
                                        )
                                      )
                                    ) : (
                                      <p className="text-zinc-500">
                                        No structured improvement guidance was returned.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {parsedEvaluation.rawMarkdown && (
                                <div className="border-t border-zinc-800 bg-zinc-950/80 p-5 md:p-6">
                                  <p className="mb-4 text-xs uppercase tracking-[0.22em] text-zinc-500">
                                    Full Evaluation
                                  </p>

                                  <div className="prose prose-invert max-w-none text-zinc-200">
                                    <ReactMarkdown>
                                      {
                                        parsedEvaluation.rawMarkdown
                                      }
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </article>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
