"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Clock3,
  Link2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Stage = "today" | "lesson" | "encode" | "recall" | "results";

type Pair = {
  cue: string;
  target: string;
  example: string;
};

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute: () => Promise<string>;
    },
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
};

const PAIRS: Pair[] = [
  {
    cue: "Lantern",
    target: "Pineapple",
    example: "A glowing lantern bursts open and rains pineapple juice.",
  },
  {
    cue: "Violin",
    target: "Ladder",
    example: "A violin stretches its strings into a towering ladder.",
  },
  {
    cue: "Teapot",
    target: "Roller skate",
    example: "A whistling teapot races past you on roller skates.",
  },
];

function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.,!?;:]+$/g, "");
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-[14px] bg-mint text-ink shadow-[0_0_0_5px_rgba(102,240,194,0.08)]">
        <Brain aria-hidden="true" className="size-5" strokeWidth={2.4} />
      </span>
      <div>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-mint/75">
          MindBetter
        </p>
        <p className="text-sm font-medium text-slate-300">Memory practice</p>
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="trace-grid pointer-events-none fixed inset-0" />
      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.035] px-3 py-2 text-xs font-medium text-slate-300">
            <ShieldCheck aria-hidden="true" className="size-4 text-mint" />
            <span className="hidden sm:inline">Private by design</span>
            <span className="sm:hidden">Private</span>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-5 py-7 sm:px-8 sm:py-10">
        {children}
      </div>
    </main>
  );
}

function Today({ onStart }: { onStart: () => void }) {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Foundation · Session 1</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Train the link between two ideas.
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock3 aria-hidden="true" className="size-4" />
          About 5 minutes
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-panel p-6 shadow-2xl shadow-black/20 sm:p-9">
          <div className="absolute right-[-5rem] top-[-7rem] size-72 rounded-full bg-mint/10 blur-3xl" />
          <div className="relative">
            <div className="mb-12 flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl border border-mint/25 bg-mint/10 text-mint">
                <Link2 aria-hidden="true" className="size-6" />
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                Today
              </span>
            </div>

            <p className="text-sm font-semibold text-mint">Association</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Make ordinary pairs impossible to forget.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              You’ll learn one technique, create three vivid mental links, then
              retrieve each missing word without seeing the answer.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {["Learn the method", "Encode 3 pairs", "Recall from memory"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/8 text-xs font-semibold text-mint">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ),
              )}
            </div>

            <Button
              className="mt-8 h-12 rounded-xl bg-mint px-6 text-base font-bold text-ink hover:bg-mint/90"
              onClick={onStart}
              size="lg"
            >
              Begin association
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </section>

        <aside className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <section className="rounded-[24px] border border-white/8 bg-white/[0.035] p-6">
            <p className="eyebrow">Your path</p>
            <div className="mt-7 flex items-center justify-between">
              <span className="text-3xl font-semibold tracking-tight">1 of 6</span>
              <span className="text-sm text-slate-400">Foundation</span>
            </div>
            <Progress className="mt-4 h-2 bg-white/8 [&>div]:bg-mint" value={16} />
            <p className="mt-4 text-sm leading-6 text-slate-400">
              This session introduces the method and ends with a short recall check.
            </p>
          </section>

          <section className="rounded-[24px] border border-white/8 bg-white/[0.035] p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Reviews</p>
              <span className="grid size-8 place-items-center rounded-full bg-white/6 text-sm font-semibold text-slate-300">
                0
              </span>
            </div>
            <p className="mt-7 text-lg font-semibold">Nothing due yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Scheduled reviews will appear here as your practice grows.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function SessionFrame({ children, label, progress, onExit }: { children: React.ReactNode; label: string; progress: number; onExit: () => void }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <Button aria-label="Return to today" className="size-10 rounded-xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10" onClick={onExit} size="icon" variant="outline">
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Button>
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>{label}</span><span>{progress}%</span>
            </div>
            <Progress className="h-1.5 bg-white/8 [&>div]:bg-mint" value={progress} />
          </div>
        </div>
        {children}
      </div>
    </AppShell>
  );
}

function Lesson({ onNext, onExit }: { onNext: () => void; onExit: () => void }) {
  return (
    <SessionFrame label="Learn" onExit={onExit} progress={12}>
      <section className="rounded-[28px] border border-white/10 bg-panel p-6 sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-mint/10 text-mint"><Sparkles aria-hidden="true" className="size-6" /></span>
        <p className="eyebrow mt-8">The association method</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Turn a weak link into a vivid event.</h1>
        <p className="mt-5 text-base leading-7 text-slate-300">When two words have no natural connection, make them interact. Exaggerate the scale, add movement, and let something surprising happen.</p>
        <div className="my-8 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="word-tile">Hammer</div><span className="mx-auto text-xl font-bold text-mint">+</span><div className="word-tile">Strawberry</div>
        </div>
        <div className="rounded-2xl border border-mint/20 bg-mint/[0.07] p-5 text-sm leading-6 text-slate-200">Imagine a giant hammer smashing a strawberry and spraying bright red juice across the room. Movement and surprise make the link easier to retrieve.</div>
        <Button className="mt-8 h-12 w-full rounded-xl bg-mint font-bold text-ink hover:bg-mint/90 sm:w-auto" onClick={onNext} size="lg">Practice with three pairs<ArrowRight aria-hidden="true" className="size-4" /></Button>
      </section>
    </SessionFrame>
  );
}

function Encode({ index, onNext, onExit }: { index: number; onNext: () => void; onExit: () => void }) {
  const pair = PAIRS[index];
  const isLast = index === PAIRS.length - 1;
  return (
    <SessionFrame label={`Encode · Pair ${index + 1} of ${PAIRS.length}`} onExit={onExit} progress={25 + index * 15}>
      <section className="rounded-[28px] border border-white/10 bg-panel p-6 text-center sm:p-10">
        <p className="eyebrow">Create the scene</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Make these objects interact.</h1>
        <div className="my-9 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="word-tile word-tile-large">{pair.cue}</div><span className="mx-auto text-2xl font-bold text-mint">+</span><div className="word-tile word-tile-large">{pair.target}</div>
        </div>
        <div className="mx-auto max-w-xl rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Need a spark?</p><p className="mt-2 text-sm leading-6 text-slate-300">{pair.example}</p>
        </div>
        <Button className="mt-8 h-12 w-full rounded-xl bg-mint font-bold text-ink hover:bg-mint/90 sm:w-auto" onClick={onNext} size="lg">{isLast ? "Start recall" : "I can picture it"}<ArrowRight aria-hidden="true" className="size-4" /></Button>
      </section>
    </SessionFrame>
  );
}

function Recall({ answers, index, onAnswer, onExit }: { answers: string[]; index: number; onAnswer: (answer: string) => void; onExit: () => void }) {
  const [answer, setAnswer] = useState(answers[index] ?? "");
  const pair = PAIRS[index];
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (answer.trim()) onAnswer(answer); }
  return (
    <SessionFrame label={`Recall · Pair ${index + 1} of ${PAIRS.length}`} onExit={onExit} progress={70 + index * 10}>
      <section className="rounded-[28px] border border-white/10 bg-panel p-6 sm:p-10">
        <p className="eyebrow">Retrieve from memory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">What was linked with this word?</h1>
        <div className="word-tile word-tile-large my-9 text-center">{pair.cue}</div>
        <form onSubmit={submit}>
          <label className="text-sm font-semibold text-slate-200" htmlFor="recall-answer">Your answer</label>
          <input autoComplete="off" autoFocus className="mt-3 h-14 w-full rounded-2xl border border-white/12 bg-ink/55 px-5 text-lg text-white outline-none transition placeholder:text-slate-600 focus:border-mint focus:ring-4 focus:ring-mint/10" id="recall-answer" onChange={(event) => setAnswer(event.target.value)} placeholder="Type the missing word" value={answer} />
          <p className="mt-3 text-sm text-slate-400">Small differences in capitalization and punctuation won’t count against you.</p>
          <Button className="mt-7 h-12 w-full rounded-xl bg-mint font-bold text-ink hover:bg-mint/90 sm:w-auto" disabled={!answer.trim()} size="lg" type="submit">{index === PAIRS.length - 1 ? "See results" : "Submit and continue"}<ArrowRight aria-hidden="true" className="size-4" /></Button>
        </form>
      </section>
    </SessionFrame>
  );
}

function Results({ answers, onDone, onRetry }: { answers: string[]; onDone: () => void; onRetry: () => void }) {
  const results = useMemo(() => PAIRS.map((pair, index) => ({ ...pair, answer: answers[index] ?? "", correct: normalizeAnswer(answers[index] ?? "") === normalizeAnswer(pair.target) })), [answers]);
  const correct = results.filter((result) => result.correct).length;
  return (
    <SessionFrame label="Complete" onExit={onDone} progress={100}>
      <section className="rounded-[28px] border border-white/10 bg-panel p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Session complete</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{correct === PAIRS.length ? "Every link held." : "Your first memory trace is in place."}</h1></div>
          <div className="shrink-0 rounded-2xl border border-mint/20 bg-mint/[0.08] px-6 py-4 text-center"><p className="text-3xl font-semibold text-mint">{correct}/{PAIRS.length}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Recalled</p></div>
        </div>
        <div className="mt-8 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
          {results.map((result) => (
            <div className="grid gap-3 bg-white/[0.025] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:px-5" key={result.cue}>
              <p className="font-semibold text-white">{result.cue}</p>
              <div><p className="text-sm text-slate-300">{result.answer}</p>{!result.correct && <p className="mt-1 text-xs text-slate-500">Answer: {result.target}</p>}</div>
              <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${result.correct ? "bg-mint/10 text-mint" : "bg-rose-400/10 text-rose-300"}`}>
                {result.correct ? <Check aria-hidden="true" className="size-3.5" /> : <X aria-hidden="true" className="size-3.5" />}{result.correct ? "Correct" : "Missed"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="h-12 rounded-xl bg-mint font-bold text-ink hover:bg-mint/90" onClick={onDone} size="lg">Finish session<Check aria-hidden="true" className="size-4" /></Button>
          <Button className="h-12 rounded-xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10" onClick={onRetry} size="lg" variant="outline"><RotateCcw aria-hidden="true" className="size-4" />Practice again</Button>
        </div>
      </section>
    </SessionFrame>
  );
}

export function TrainingFlow() {
  const [stage, setStage] = useState<Stage>("today");
  const [pairIndex, setPairIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    const modelContext = (
      document as Document & { modelContext?: ModelContext }
    ).modelContext;
    if (!modelContext) return;

    const controller = new AbortController();
    void modelContext
      .registerTool(
        {
          name: "start_association_training",
          description:
            "Starts MindBetter's introductory association-memory lesson from the beginning.",
          inputSchema: { type: "object", properties: {} },
          async execute() {
            setAnswers([]);
            setPairIndex(0);
            setStage("lesson");
            return "The introductory association lesson is now open.";
          },
        },
        { signal: controller.signal },
      )
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  function reset(nextStage: Stage = "lesson") { setAnswers([]); setPairIndex(0); setStage(nextStage); }
  function advanceEncoding() { if (pairIndex === PAIRS.length - 1) { setPairIndex(0); setStage("recall"); } else { setPairIndex((current) => current + 1); } }
  function saveAnswer(answer: string) {
    setAnswers((current) => { const next = [...current]; next[pairIndex] = answer; return next; });
    if (pairIndex === PAIRS.length - 1) setStage("results"); else setPairIndex((current) => current + 1);
  }
  if (stage === "lesson") return <Lesson onExit={() => setStage("today")} onNext={() => setStage("encode")} />;
  if (stage === "encode") return <Encode index={pairIndex} onExit={() => setStage("today")} onNext={advanceEncoding} />;
  if (stage === "recall") return <Recall answers={answers} index={pairIndex} key={pairIndex} onAnswer={saveAnswer} onExit={() => setStage("today")} />;
  if (stage === "results") return <Results answers={answers} onDone={() => reset("today")} onRetry={() => reset("encode")} />;
  return <Today onStart={() => setStage("lesson")} />;
}
