"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CourseLesson, TeachingPage } from "@/lib/curriculum";

export function GuidedLesson({
  alreadyComplete,
  initialPage = 0,
  lesson,
  onComplete,
  onExit,
  onPageChange,
  pages,
}: {
  alreadyComplete: boolean;
  initialPage?: number;
  lesson: CourseLesson;
  onComplete: () => Promise<void>;
  onExit: () => void;
  onPageChange: (pageIndex: number) => void;
  pages: TeachingPage[];
}) {
  const [pageIndex, setPageIndex] = useState(Math.min(initialPage, pages.length - 1));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wasAlreadyComplete] = useState(alreadyComplete);
  const page = pages[pageIndex];
  const pageProgress = finished ? 100 : Math.round(((pageIndex + 1) / (pages.length + 1)) * 100);

  function advance() {
    if (pageIndex < pages.length - 1) {
      const nextIndex = pageIndex + 1;
      setPageIndex(nextIndex);
      setSelectedIndex(null);
      setAnswered(false);
      onPageChange(nextIndex);
      return;
    }
    void onComplete().then(() => setFinished(true));
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[28px] border border-mint/25 bg-panel p-7 text-center shadow-[0_0_80px_rgba(102,240,194,0.08)] sm:p-12">
          <span className="mx-auto grid size-20 place-items-center rounded-[26px] bg-mint text-ink">
            <Check aria-hidden="true" className="size-10" strokeWidth={2.5} />
          </span>
          <p className="eyebrow mt-8">Lesson complete</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{lesson.title}</h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-300">
            The next lesson is now unlocked. Revisiting this lesson later still strengthens the technique without awarding duplicate completion XP.
          </p>
          <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-4 py-2 text-sm font-bold text-amber-100">
            <Star aria-hidden="true" className="size-4 fill-current" />
            {wasAlreadyComplete ? "Practice complete" : `+${lesson.xp} XP`}
          </div>
          <Button className="mt-8 h-12 rounded-xl bg-mint px-6 font-bold text-ink hover:bg-mint/90" onClick={onExit} size="lg">
            Continue on path
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Button aria-label="Save and return to course" className="size-10 rounded-xl border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10" onClick={onExit} size="icon" variant="outline">
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span>{lesson.title}</span><span>{pageProgress}%</span>
          </div>
          <Progress className="h-1.5 bg-white/8 [&>div]:bg-mint" value={pageProgress} />
        </div>
      </div>

      {page.type === "teach" ? (
        <section className="rounded-[28px] border border-white/10 bg-panel p-6 sm:p-10">
          <span className="grid size-12 place-items-center rounded-2xl bg-mint/10 text-mint">
            <Lightbulb aria-hidden="true" className="size-6" />
          </span>
          <p className="eyebrow mt-8">{page.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{page.title}</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">{page.body}</p>
          <div className="mt-8 rounded-2xl border border-mint/20 bg-mint/[0.07] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-mint"><Sparkles aria-hidden="true" className="size-4" />Example</div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{page.example}</p>
          </div>
          <Button className="mt-8 h-12 w-full rounded-xl bg-mint font-bold text-ink hover:bg-mint/90 sm:w-auto" onClick={advance} size="lg">
            Check my understanding
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </section>
      ) : (
        <section className="rounded-[28px] border border-white/10 bg-panel p-6 sm:p-10">
          <p className="eyebrow">Knowledge check · {pageIndex + 1} of {pages.length}</p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl">{page.question}</h1>
          <RadioGroup
            className="mt-8"
            onValueChange={(value) => {
              setSelectedIndex(Number(value));
              setAnswered(false);
            }}
            value={selectedIndex === null ? "" : String(selectedIndex)}
          >
            {page.choices.map((choice, index) => {
              const isCorrect = answered && index === page.correctIndex;
              const isWrong = answered && index === selectedIndex && selectedIndex !== page.correctIndex;
              return (
                <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${isCorrect ? "border-mint/45 bg-mint/[0.09]" : isWrong ? "border-rose-300/35 bg-rose-300/[0.07]" : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"}`} key={choice}>
                  <RadioGroupItem className="border-white/20 text-mint" disabled={answered} value={String(index)} />
                  <span className="text-sm font-medium leading-6 text-slate-200">{choice}</span>
                </label>
              );
            })}
          </RadioGroup>

          {answered && (
            <div className={`mt-6 rounded-2xl border p-5 ${selectedIndex === page.correctIndex ? "border-mint/20 bg-mint/[0.07]" : "border-rose-300/20 bg-rose-300/[0.06]"}`}>
              <p className={`font-semibold ${selectedIndex === page.correctIndex ? "text-mint" : "text-rose-200"}`}>{selectedIndex === page.correctIndex ? "That’s the idea." : "Not quite yet."}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{page.explanation}</p>
            </div>
          )}

          {!answered ? (
            <Button className="mt-7 h-12 w-full rounded-xl bg-mint font-bold text-ink hover:bg-mint/90 sm:w-auto" disabled={selectedIndex === null} onClick={() => setAnswered(true)} size="lg">Check answer<Check aria-hidden="true" className="size-4" /></Button>
          ) : selectedIndex === page.correctIndex ? (
            <Button className="mt-7 h-12 w-full rounded-xl bg-mint font-bold text-ink hover:bg-mint/90 sm:w-auto" onClick={advance} size="lg">{pageIndex === pages.length - 1 ? "Complete lesson" : "Next question"}<ArrowRight aria-hidden="true" className="size-4" /></Button>
          ) : (
            <Button className="mt-7 h-12 w-full rounded-xl border-white/10 bg-white/[0.04] text-white hover:bg-white/10 sm:w-auto" onClick={() => { setSelectedIndex(null); setAnswered(false); }} size="lg" variant="outline"><RotateCcw aria-hidden="true" className="size-4" />Try again</Button>
          )}
        </section>
      )}
    </div>
  );
}
