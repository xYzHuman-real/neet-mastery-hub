import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuestionCard } from "@/components/QuestionCard";
import { QUESTIONS, MODES, chapterById } from "@/data/neet";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/practice")({
  validateSearch: z.object({
    chapter: z.string().optional(),
    mode: z.enum(["mcq", "fib", "diagram", "ar", "pyq"]).optional(),
    review: z.boolean().optional(),
    mistakes: z.boolean().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Active Recall Practice — NEET Recall" },
      { name: "description", content: "Answer NCERT line-based questions with instant citations and spaced repetition ratings." },
      { property: "og:title", content: "Active Recall Practice — NEET Recall" },
      { property: "og:description", content: "Flashcard-style NEET practice with exact NCERT citations." },
    ],
  }),
  component: Practice,
});

function Practice() {
  const { chapter, mode, review, mistakes: mk } = Route.useSearch();
  const { dueToday, mistakes } = useStore();
  const [deck] = useState(() => {
    let qs = QUESTIONS;
    if (review) qs = qs.filter((q) => dueToday.includes(q.id));
    else if (mk) qs = qs.filter((q) => mistakes[q.id]);
    else {
      if (chapter) qs = qs.filter((q) => q.chapterId === chapter);
      if (mode) qs = qs.filter((q) => q.mode === mode);
    }
    return qs.length ? qs : QUESTIONS;
  });
  const [i, setI] = useState(0);
  const title = useMemo(() => review ? "Revision Deck" : mk ? "Mistake Revision" : chapter ? chapterById(chapter)?.name ?? "Practice" : "Mixed Practice", [review, mk, chapter]);
  const done = i >= deck.length;

  return (
    <AppShell title={title} subtitle={mode ? MODES.find((m) => m.id === mode)?.label : "Active Recall"}
      right={<span className="text-sm font-semibold text-muted-foreground">{Math.min(i + 1, deck.length)}/{deck.length}</span>}>
      <div className="mb-4 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(i / deck.length) * 100}%` }} /></div>
      {done ? (
        <div className="rounded-3xl border bg-card p-8 text-center">
          <p className="text-4xl">🎯</p>
          <p className="mt-2 font-display text-xl font-bold">Session complete</p>
          <p className="text-sm text-muted-foreground">Cards scheduled for their next review.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setI(0)} className="flex-1 rounded-2xl border py-3 text-sm font-semibold">Repeat</button>
            <Link to="/" className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">Home</Link>
          </div>
        </div>
      ) : (
        <QuestionCard key={deck[i].id + i} q={deck[i]} onNext={() => setI(i + 1)} />
      )}
    </AppShell>
  );
}
