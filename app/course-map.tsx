"use client";

import {
  Binoculars,
  Brain,
  Check,
  ChevronRight,
  Flame,
  Footprints,
  GraduationCap,
  LockKeyhole,
  Map,
  Play,
  Sparkles,
  Star,
  Target,
  Trophy,
  Download,
  Trash2,
  Users,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { ALL_LESSONS, COURSE_UNITS, getNextLessonId, isLessonPlayable, type CourseLesson, type LessonKind } from "@/lib/curriculum";
import type { ProgressRecord } from "@/lib/memory-storage";

const kindIcons: Record<LessonKind, typeof Brain> = {
  baseline: Target,
  concept: GraduationCap,
  drill: Brain,
  checkpoint: Trophy,
  palace: Map,
  people: Users,
  numbers: Sparkles,
  mission: Binoculars,
};

function LessonNode({
  lesson,
  status,
  onSelect,
}: {
  lesson: CourseLesson;
  status: "complete" | "current" | "locked" | "planned";
  onSelect: () => void;
}) {
  const Icon = kindIcons[lesson.kind];
  return (
    <button
      className={`group grid w-full grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 rounded-[20px] border p-3 text-left transition sm:p-4 ${
        status === "current"
          ? "border-mint/40 bg-mint/[0.08] shadow-[0_0_0_4px_rgba(102,240,194,0.04)] hover:bg-mint/[0.12]"
          : status === "complete"
            ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
            : status === "planned"
              ? "cursor-not-allowed border-sky-300/10 bg-sky-300/[0.035] opacity-70"
              : "cursor-not-allowed border-white/6 bg-white/[0.02] opacity-55"
      }`}
      disabled={status === "locked" || status === "planned"}
      onClick={onSelect}
      type="button"
    >
      <span
        className={`grid size-14 place-items-center rounded-2xl border ${
          status === "current"
            ? "border-mint/30 bg-mint text-ink"
            : status === "complete"
              ? "border-mint/20 bg-mint/10 text-mint"
              : "border-white/8 bg-white/[0.03] text-slate-500"
        }`}
      >
        {status === "complete" ? (
          <Check aria-hidden="true" className="size-6" strokeWidth={2.5} />
        ) : status === "locked" || status === "planned" ? (
          <LockKeyhole aria-hidden="true" className="size-5" />
        ) : (
          <Icon aria-hidden="true" className="size-6" />
        )}
      </span>
      <span className="min-w-0">
        <span className={`block text-base font-semibold ${status === "locked" || status === "planned" ? "text-slate-400" : "text-white"}`}>
          {lesson.title}
        </span>
        <span className="mt-1 block text-sm leading-5 text-slate-400">
          {lesson.summary}
        </span>
        <span className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
          <span>{lesson.minutes} min</span>
          <span>{lesson.xp} XP</span>
          {status === "planned" && <span className="text-sky-200/70">Coming next</span>}
        </span>
      </span>
      {status !== "locked" && status !== "planned" && (
        <ChevronRight aria-hidden="true" className="size-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-mint" />
      )}
    </button>
  );
}

export function CourseMap({
  onExport,
  onReset,
  onSelectLesson,
  progress,
}: {
  onExport: () => void;
  onReset: () => void;
  onSelectLesson: (lessonId: string) => void;
  progress: ProgressRecord;
}) {
  const currentLessonId = getNextLessonId(progress.completedLessonIds);
  const currentIndex = currentLessonId
    ? ALL_LESSONS.findIndex((lesson) => lesson.id === currentLessonId)
    : ALL_LESSONS.length;
  const completion = Math.round(
    (progress.completedLessonIds.length / ALL_LESSONS.length) * 100,
  );

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <section className="mb-6 grid grid-cols-3 gap-3 sm:hidden">
        <div className="stat-chip"><Flame className="size-4 text-orange-300" /><strong>{progress.streak}</strong><span>days</span></div>
        <div className="stat-chip"><Star className="size-4 text-amber-200" /><strong>{progress.xp}</strong><span>XP</span></div>
        <div className="stat-chip"><Target className="size-4 text-mint" /><strong>{completion}%</strong><span>course</span></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start">
        <section>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Your learning path</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Build a memory that works on purpose.
              </h1>
            </div>
            <Footprints aria-hidden="true" className="hidden size-10 text-mint/50 sm:block" />
          </div>

          <Accordion className="space-y-4" defaultValue={["foundations"]} type="multiple">
            {COURSE_UNITS.map((unit) => {
              const unitLessons = unit.lessons;
              const completedCount = unitLessons.filter((lesson) =>
                progress.completedLessonIds.includes(lesson.id),
              ).length;
              const firstIndex = ALL_LESSONS.findIndex(
                (lesson) => lesson.id === unitLessons[0].id,
              );
              const isUnitLocked = firstIndex > currentIndex;
              return (
                <AccordionItem
                  className="overflow-hidden rounded-[24px] border border-white/8 bg-panel/90 px-5 sm:px-6"
                  key={unit.id}
                  value={unit.id}
                >
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <span className="flex min-w-0 items-center gap-4">
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-ink"
                        style={{ backgroundColor: isUnitLocked ? "#334155" : unit.color }}
                      >
                        {isUnitLocked ? <LockKeyhole className="size-5 text-slate-300" /> : unit.number}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
                          Unit {unit.number} · {completedCount}/{unitLessons.length}
                        </span>
                        <span className="mt-1 block text-lg font-semibold text-white">{unit.title}</span>
                        <span className="mt-1 block text-sm font-normal leading-5 text-slate-400">{unit.subtitle}</span>
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="ml-0 space-y-3 sm:ml-4">
                      {unitLessons.map((lesson) => {
                        const lessonIndex = ALL_LESSONS.findIndex((item) => item.id === lesson.id);
                        const sequenceStatus = progress.completedLessonIds.includes(lesson.id)
                          ? "complete"
                          : lessonIndex === currentIndex
                            ? "current"
                            : "locked";
                        const status = sequenceStatus === "current" && !isLessonPlayable(lesson.id)
                          ? "planned"
                          : sequenceStatus;
                        return (
                          <LessonNode
                            key={lesson.id}
                            lesson={lesson}
                            onSelect={() => onSelectLesson(lesson.id)}
                            status={status}
                          />
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        <aside className="sticky top-6 hidden space-y-4 lg:block">
          <section className="rounded-[24px] border border-white/8 bg-panel p-6">
            <p className="eyebrow">This week</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.04] p-4"><Flame className="size-5 text-orange-300" /><p className="mt-3 text-2xl font-semibold">{progress.streak}</p><p className="text-sm text-slate-500">day streak</p></div>
              <div className="rounded-2xl bg-white/[0.04] p-4"><Star className="size-5 text-amber-200" /><p className="mt-3 text-2xl font-semibold">{progress.xp}</p><p className="text-sm text-slate-500">total XP</p></div>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/8 bg-panel p-6">
            <div className="flex items-center justify-between"><p className="eyebrow">Course progress</p><span className="text-sm font-semibold text-mint">{completion}%</span></div>
            <Progress className="mt-4 h-2 bg-white/8 [&>div]:bg-mint" value={completion} />
            <p className="mt-4 text-sm leading-6 text-slate-400">
              {progress.completedLessonIds.length} of {ALL_LESSONS.length} lessons complete across eight skill units.
            </p>
          </section>

          {currentLessonId && isLessonPlayable(currentLessonId) ? (
            <Button className="h-auto w-full justify-between rounded-2xl bg-mint px-5 py-4 text-left font-bold text-ink hover:bg-mint/90" onClick={() => onSelectLesson(currentLessonId)}>
              <span><span className="block text-xs uppercase tracking-[0.12em] opacity-60">Continue</span><span className="mt-1 block">{ALL_LESSONS[currentIndex].title}</span></span>
              <Play aria-hidden="true" className="size-5 fill-current" />
            </Button>
          ) : currentLessonId ? (
            <section className="rounded-[24px] border border-sky-300/10 bg-sky-300/[0.04] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-sky-200">Next unit planned</p>
              <p className="mt-2 font-semibold text-white">{ALL_LESSONS[currentIndex].title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">The complete course map is visible now; this lesson becomes playable in the next build increment.</p>
            </section>
          ) : null}
        </aside>
      </div>
      <footer className="mt-7 flex flex-col justify-between gap-4 border-t border-white/8 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center">
        <p>Your progress stays in this browser and can be exported at any time.</p>
        <div className="flex flex-wrap gap-2">
          <Button className="border-white/8 bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white" onClick={onExport} size="sm" variant="outline">
            <Download aria-hidden="true" className="size-4" />Export data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="border-white/8 bg-transparent text-slate-400 hover:bg-rose-400/10 hover:text-rose-200" size="sm" variant="outline">
                <Trash2 aria-hidden="true" className="size-4" />Reset data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-panel text-white">
              <AlertDialogHeader><AlertDialogTitle>Reset all MindBetter data?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">This permanently removes lesson progress, XP, streaks, and unfinished practice saved in this browser.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10 hover:text-white">Keep it</AlertDialogCancel><AlertDialogAction className="bg-mint font-bold text-ink hover:bg-mint/90" onClick={onReset}>Reset everything</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </footer>
    </div>
  );
}
