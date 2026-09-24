"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Clock3,
  Download,
  Link2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CourseMap } from "./course-map";
import { GuidedLesson } from "./guided-lesson";
import { FOUNDATION_CONTENT, getLesson } from "@/lib/curriculum";
import {
  clearGuidedSession,
  clearMindBetterData,
  EMPTY_PROGRESS,
  exportMindBetterData,
  loadMindBetterData,
  normalizeAnswer,
  saveCompletion,
  saveGuidedSession,
  saveProgress,
  saveSession,
  scoreAnswers,
  type GuidedSessionRecord,
  type ProgressRecord,
  type SessionRecord,
  type StoredAnswer,
  type TrainingStage,
} from "@/lib/memory-storage";

type Stage = "today" | TrainingStage;

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

const TARGETS = PAIRS.map((pair) => pair.target);

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
            <span className="hidden sm:inline">Saved on this device</span>
            <span className="sm:hidden">Saved</span>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-5 py-7 sm:px-8 sm:py-10">
        {children}
      </div>
    </main>
  );
}

function ConfirmAction({
  actionLabel,
  children,
  description,
  onConfirm,
  title,
}: {
  actionLabel: string;
  children: React.ReactNode;
  description: string;
  onConfirm: () => void | Promise<void>;
  title: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-panel text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10 hover:text-white">
            Keep it
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-mint font-bold text-ink hover:bg-mint/90"
            onClick={onConfirm}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Kept temporarily as a reference while the course map replaces the original dashboard.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Today({
  activeSession,
  onExport,
  onReset,
  onRestart,
  onResume,
  onStart,
  progress,
}: {
  activeSession: SessionRecord | null;
  onExport: () => void;
  onReset: () => void;
  onRestart: () => void;
  onResume: () => void;
  onStart: () => void;
  progress: ProgressRecord;
}) {
  const hasActiveSession = activeSession?.status === "in_progress";
  const hasProgress = progress.completedSessions > 0;
  const accuracy = progress.totalAttempts
    ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
    : 0;

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Foundation · Session 1</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            {hasActiveSession
              ? "Your memory session is waiting."
              : hasProgress
                ? "Keep strengthening the link."
                : "Train the link between two ideas."}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock3 aria-hidden="true" className="size-4" />
          About 5 minutes
        </div>
      </div>

      {hasActiveSession && (
        <section className="mb-5 flex flex-col gap-5 rounded-[24px] border border-amber-300/20 bg-amber-300/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-200">
              Unfinished session
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              Continue from {activeSession.stage === "recall" ? "recall" : activeSession.stage} · step {activeSession.pairIndex + 1}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Your answers and exact position were saved automatically.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-11 rounded-xl bg-mint font-bold text-ink hover:bg-mint/90"
              onClick={onResume}
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Resume
            </Button>
            <ConfirmAction
              actionLabel="Restart"
              description="This removes the unfinished answers and starts the lesson again. Completed-session progress is unaffected."
              onConfirm={onRestart}
              title="Restart this session?"
            >
              <Button className="h-11 rounded-xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10" variant="outline">
                <RotateCcw aria-hidden="true" className="size-4" />
                Restart
              </Button>
            </ConfirmAction>
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-panel p-6 shadow-2xl shadow-black/20 sm:p-9">
          <div className="absolute right-[-5rem] top-[-7rem] size-72 rounded-full bg-mint/10 blur-3xl" />
          <div className="relative">
            <div className="mb-12 flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl border border-mint/25 bg-mint/10 text-mint">
                <Link2 aria-hidden="true" className="size-6" />
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                {hasProgress ? "Practice" : "Today"}
              </span>
            </div>
            <p className="text-sm font-semibold text-mint">Association</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Make ordinary pairs impossible to forget.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Learn one technique, create three vivid mental links, then retrieve
              each missing word without seeing the answer.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {["Learn the method", "Encode 3 pairs", "Recall from memory"].map(
                (item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
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
              onClick={hasActiveSession ? onResume : onStart}
              size="lg"
            >
              {hasActiveSession ? "Resume association" : hasProgress ? "Practice again" : "Begin association"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </section>

        <aside className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <section className="rounded-[24px] border border-white/8 bg-white/[0.035] p-6">
            <p className="eyebrow">Your path</p>
            <div className="mt-7 flex items-center justify-between">
              <span className="text-3xl font-semibold tracking-tight">
                {hasProgress ? "1 complete" : "1 of 6"}
              </span>
              <span className="text-sm text-slate-400">Foundation</span>
            </div>
            <Progress className="mt-4 h-2 bg-white/8 [&>div]:bg-mint" value={hasProgress ? 16 : 4} />
            <p className="mt-4 text-sm leading-6 text-slate-400">
              {hasProgress
                ? "Your first technique is recorded on this device."
                : "This session introduces the method and a short recall check."}
            </p>
          </section>

          <section className="rounded-[24px] border border-white/8 bg-white/[0.035] p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Recall record</p>
              <Trophy aria-hidden="true" className="size-5 text-amber-200" />
            </div>
            {hasProgress ? (
              <>
                <div className="mt-7 flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold">{accuracy}%</p>
                  <p className="pb-1 text-sm text-slate-400">
                    {progress.totalCorrect}/{progress.totalAttempts} recalled
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Best session: {progress.bestScore}/{PAIRS.length}
                </p>
              </>
            ) : (
              <>
                <p className="mt-7 text-lg font-semibold">No result yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Finish the recall check to create your first record.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>

      <footer className="mt-6 flex flex-col justify-between gap-4 border-t border-white/8 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center">
        <p>Your training data stays in this browser.</p>
        <div className="flex flex-wrap gap-2">
          <Button className="border-white/8 bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white" onClick={onExport} size="sm" variant="outline">
            <Download aria-hidden="true" className="size-4" />
            Export data
          </Button>
          <ConfirmAction
            actionLabel="Reset everything"
            description="This permanently removes the unfinished session and all completed-session progress stored by MindBetter in this browser."
            onConfirm={onReset}
            title="Reset all MindBetter data?"
          >
            <Button className="border-white/8 bg-transparent text-slate-400 hover:bg-rose-400/10 hover:text-rose-200" size="sm" variant="outline">
              <Trash2 aria-hidden="true" className="size-4" />
              Reset data
            </Button>
          </ConfirmAction>
        </div>
      </footer>
    </AppShell>
  );
}

function SessionFrame({ children, label, progress, onExit }: { children: React.ReactNode; label: string; progress: number; onExit: () => void }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <Button aria-label="Save and return to today" className="size-10 rounded-xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10" onClick={onExit} size="icon" variant="outline">
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

function Recall({ answers, index, onAnswer, onExit }: { answers: StoredAnswer[]; index: number; onAnswer: (answer: string) => void; onExit: () => void }) {
  const [answer, setAnswer] = useState(answers[index]?.raw ?? "");
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

function Results({ answers, onDone, onRetry }: { answers: StoredAnswer[]; onDone: () => void; onRetry: () => void }) {
  const results = useMemo(() => PAIRS.map((pair, index) => ({ ...pair, answer: answers[index]?.raw ?? "", correct: answers[index]?.normalized === normalizeAnswer(pair.target) })), [answers]);
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
          <Button className="h-12 rounded-xl bg-mint font-bold text-ink hover:bg-mint/90" onClick={onDone} size="lg">Save and finish<Check aria-hidden="true" className="size-4" /></Button>
          <Button className="h-12 rounded-xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10" onClick={onRetry} size="lg" variant="outline"><RotateCcw aria-hidden="true" className="size-4" />Practice again</Button>
        </div>
      </section>
    </SessionFrame>
  );
}

function LoadingState() {
  return (
    <AppShell>
      <div className="mx-auto mt-16 max-w-md rounded-[24px] border border-white/8 bg-panel p-8 text-center">
        <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-white/10 border-t-mint" />
        <p className="mt-5 font-semibold">Loading your practice</p>
        <p className="mt-2 text-sm text-slate-400">Checking for a saved session on this device.</p>
      </div>
    </AppShell>
  );
}

export function TrainingFlow() {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<Stage>("today");
  const [pairIndex, setPairIndex] = useState(0);
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [guidedSession, setGuidedSession] = useState<GuidedSessionRecord | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressRecord>(EMPTY_PROGRESS);

  useEffect(() => {
    let active = true;
    void loadMindBetterData()
      .then((data) => {
        if (!active) return;
        setSession(data.session);
        setGuidedSession(data.guidedSession);
        setProgress(data.progress);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!modelContext) return;
    const controller = new AbortController();
    void modelContext.registerTool(
      {
        name: "start_association_training",
        description: "Starts MindBetter's introductory association-memory lesson from the beginning.",
        inputSchema: { type: "object", properties: {} },
        async execute() {
          await beginFreshSession();
          return "The introductory association lesson is now open and will save automatically.";
        },
      },
      { signal: controller.signal },
    ).catch(() => undefined);
    return () => controller.abort();
    // WebMCP registration is intentionally scoped to this mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persistPosition(nextStage: TrainingStage, nextIndex: number, nextAnswers: StoredAnswer[], fresh = false) {
    const now = new Date().toISOString();
    const nextSession: SessionRecord = {
      id: "association-intro",
      version: 1,
      status: "in_progress",
      stage: nextStage,
      pairIndex: nextIndex,
      answers: nextAnswers,
      startedAt: fresh || !session ? now : session.startedAt,
      updatedAt: now,
    };
    setSession(nextSession);
    await saveSession(nextSession);
  }

  async function beginFreshSession() {
    setAnswers([]);
    setPairIndex(0);
    setStage("lesson");
    await persistPosition("lesson", 0, [], true);
  }

  function resumeSession() {
    if (!session || session.status !== "in_progress") return;
    setAnswers(session.answers);
    setPairIndex(session.pairIndex);
    setStage(session.stage);
  }

  async function advanceFromLesson() {
    setPairIndex(0);
    setStage("encode");
    await persistPosition("encode", 0, answers);
  }

  async function advanceEncoding() {
    if (pairIndex === PAIRS.length - 1) {
      setPairIndex(0);
      setStage("recall");
      await persistPosition("recall", 0, answers);
    } else {
      const nextIndex = pairIndex + 1;
      setPairIndex(nextIndex);
      await persistPosition("encode", nextIndex, answers);
    }
  }

  async function saveAnswer(answer: string) {
    const nextAnswers = [...answers];
    nextAnswers[pairIndex] = { raw: answer, normalized: normalizeAnswer(answer) };
    setAnswers(nextAnswers);
    if (pairIndex === PAIRS.length - 1) {
      setStage("results");
      await persistPosition("results", pairIndex, nextAnswers);
    } else {
      const nextIndex = pairIndex + 1;
      setPairIndex(nextIndex);
      await persistPosition("recall", nextIndex, nextAnswers);
    }
  }

  async function retrySession() {
    setAnswers([]);
    setPairIndex(0);
    setStage("encode");
    await persistPosition("encode", 0, [], true);
  }

  async function finishSession() {
    const score = scoreAnswers(answers, TARGETS);
    const now = new Date().toISOString();
    const nextProgress: ProgressRecord = {
      ...progress,
      version: 2,
      completedSessions: progress.completedSessions + 1,
      totalCorrect: progress.totalCorrect + score,
      totalAttempts: progress.totalAttempts + PAIRS.length,
      bestScore: Math.max(progress.bestScore, score),
      latestScore: score,
      lastCompletedAt: now,
      completedLessonIds: Array.from(
        new Set([
          ...progress.completedLessonIds,
          "foundation-baseline",
          "foundation-attention",
          "foundation-association",
        ]),
      ),
      xp: progress.xp + (progress.completedLessonIds.includes("foundation-association") ? 0 : 15),
      streak: nextStreak(progress.lastActivityDate, progress.streak),
      lastActivityDate: localDateKey(),
    };
    const completedSession: SessionRecord = {
      id: "association-intro",
      version: 1,
      status: "completed",
      stage: "results",
      pairIndex: PAIRS.length - 1,
      answers,
      startedAt: session?.startedAt ?? now,
      updatedAt: now,
      score,
    };
    await saveCompletion(completedSession, nextProgress);
    setProgress(nextProgress);
    setSession(completedSession);
    setStage("today");
  }

  async function resetAllData() {
    await clearMindBetterData();
    setProgress(EMPTY_PROGRESS);
    setSession(null);
    setGuidedSession(null);
    setSelectedLessonId(null);
    setAnswers([]);
    setPairIndex(0);
    setStage("today");
  }

  async function exportData() {
    const content = await exportMindBetterData();
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `mindbetter-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function openLesson(lessonId: string) {
    if (lessonId === "foundation-association") {
      if (session?.status === "in_progress") resumeSession();
      else await beginFreshSession();
      return;
    }

    if (!FOUNDATION_CONTENT[lessonId]) return;
    const nextGuidedSession: GuidedSessionRecord =
      guidedSession?.lessonId === lessonId
        ? guidedSession
        : { version: 1, lessonId, pageIndex: 0, updatedAt: new Date().toISOString() };
    setGuidedSession(nextGuidedSession);
    setSelectedLessonId(lessonId);
    await saveGuidedSession(nextGuidedSession);
  }

  async function persistGuidedPage(lessonId: string, pageIndex: number) {
    const nextGuidedSession: GuidedSessionRecord = {
      version: 1,
      lessonId,
      pageIndex,
      updatedAt: new Date().toISOString(),
    };
    setGuidedSession(nextGuidedSession);
    await saveGuidedSession(nextGuidedSession);
  }

  async function completeGuidedLesson(lessonId: string) {
    const lesson = getLesson(lessonId);
    if (!lesson) return;
    const alreadyComplete = progress.completedLessonIds.includes(lessonId);
    const nextProgress: ProgressRecord = {
      ...progress,
      completedLessonIds: Array.from(new Set([...progress.completedLessonIds, lessonId])),
      xp: progress.xp + (alreadyComplete ? 0 : lesson.xp),
      streak: nextStreak(progress.lastActivityDate, progress.streak),
      lastActivityDate: localDateKey(),
    };
    setProgress(nextProgress);
    setGuidedSession(null);
    await Promise.all([saveProgress(nextProgress), clearGuidedSession()]);
  }

  if (!ready) return <LoadingState />;
  if (stage === "lesson") return <Lesson onExit={() => setStage("today")} onNext={advanceFromLesson} />;
  if (stage === "encode") return <Encode index={pairIndex} onExit={() => setStage("today")} onNext={advanceEncoding} />;
  if (stage === "recall") return <Recall answers={answers} index={pairIndex} key={pairIndex} onAnswer={saveAnswer} onExit={() => setStage("today")} />;
  if (stage === "results") return <Results answers={answers} onDone={finishSession} onRetry={retrySession} />;

  const selectedLesson = selectedLessonId ? getLesson(selectedLessonId) : undefined;
  const selectedPages = selectedLessonId ? FOUNDATION_CONTENT[selectedLessonId] : undefined;
  if (selectedLesson && selectedPages) {
    return (
      <AppShell>
        <GuidedLesson
          alreadyComplete={progress.completedLessonIds.includes(selectedLesson.id)}
          initialPage={guidedSession?.lessonId === selectedLesson.id ? guidedSession.pageIndex : 0}
          lesson={selectedLesson}
          onComplete={() => completeGuidedLesson(selectedLesson.id)}
          onExit={() => setSelectedLessonId(null)}
          onPageChange={(pageIndex) => void persistGuidedPage(selectedLesson.id, pageIndex)}
          pages={selectedPages}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CourseMap
        onExport={() => void exportData()}
        onReset={() => void resetAllData()}
        onSelectLesson={(lessonId) => void openLesson(lessonId)}
        progress={progress}
      />
    </AppShell>
  );
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextStreak(lastActivityDate: string | null, currentStreak: number) {
  const today = localDateKey();
  if (lastActivityDate === today) return Math.max(1, currentStreak);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return lastActivityDate === localDateKey(yesterday) ? currentStreak + 1 : 1;
}
