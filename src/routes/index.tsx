import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Target, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CHAPTERS, QUESTIONS, SUBJECTS, SRS_INTERVALS, questionById } from "@/data/neet";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEET Recall — NCERT Progress Hub" },
      { name: "description", content: "Track NCERT syllabus mastery, streaks and spaced repetition revisions for NEET." },
      { property: "og:title", content: "NEET Recall — NCERT Progress Hub" },
      { property: "og:description", content: "Track NCERT syllabus mastery, streaks and spaced repetition revisions for NEET." },
    ],
  }),
  component: Home,
});

function Gauge({ pct, label }: { pct: number; label: string }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
        <circle cx="36" cy="36" r={r} className="fill-none stroke-muted" strokeWidth="7" />
        <circle cx="36" cy="36" r={r} className="fill-none stroke-primary" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <p className="-mt-[3.4rem] mb-6 font-display text-lg font-bold">{pct}%</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function subjectMastery(answered: Record<string, boolean>, subject: string, cls?: number) {
  const qs = QUESTIONS.filter((q) => { const ch = CHAPTERS.find((c) => c.id === q.chapterId)!; return ch.subject === subject && (!cls || ch.classLevel === cls); });
  if (!qs.length) return 0;
  return Math.round((qs.filter((q) => answered[q.id]).length / qs.length) * 100);
}

function Home() {
  const { streak, todayCount, goal, answered, dueToday, cards } = useStore();
  return (
    <AppShell title="Namaste, Rakesh" subtitle="NEET 2027">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-primary p-4 text-primary-foreground">
          <Flame className="h-5 w-5" />
          <p className="mt-2 font-display text-3xl font-bold">{streak}</p>
          <p className="text-xs opacity-80">day streak</p>
        </div>
        <div className="rounded-3xl border bg-card p-4">
          <Target className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-3xl font-bold">{Math.min(todayCount, goal)}<span className="text-base text-muted-foreground">/{goal}</span></p>
          <p className="text-xs text-muted-foreground">NCERT lines today</p>
          <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (todayCount / goal) * 100)}%` }} /></div>
        </div>
      </div>

      <section className="mt-5 rounded-3xl border bg-card p-4">
        <h2 className="font-display font-bold">NCERT Syllabus Mastery</h2>
        <div className="mt-3 grid grid-cols-3">
          {SUBJECTS.map((s) => <Gauge key={s.id} pct={subjectMastery(answered, s.id)} label={s.name} />)}
        </div>
        <div className="mt-2 space-y-1.5 text-xs">
          {SUBJECTS.map((s) => (
            <div key={s.id} className="flex justify-between text-muted-foreground">
              <span>{s.name}</span>
              <span>XI <b className="text-foreground">{subjectMastery(answered, s.id, 11)}%</b> · XII <b className="text-foreground">{subjectMastery(answered, s.id, 12)}%</b></span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-highlight/20 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold">Due for Revision Today</h2>
          <span className="rounded-full bg-highlight px-2 py-0.5 text-xs font-bold text-highlight-foreground">{dueToday.length}</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {dueToday.map((id) => (
            <div key={id} className="w-44 shrink-0 rounded-2xl bg-card p-3 text-xs">
              <p className="font-semibold text-primary">Day {SRS_INTERVALS[cards[id].step]} review</p>
              <p className="mt-1 line-clamp-2">{questionById(id)?.prompt}</p>
            </div>
          ))}
          {!dueToday.length && <p className="text-sm text-muted-foreground">All caught up 🎉</p>}
        </div>
        {dueToday.length > 0 && (
          <Link to="/practice" search={{ review: true }} className="mt-3 block rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">Start revision</Link>
        )}
      </section>

      <h2 className="mt-5 font-display font-bold">Subjects</h2>
      <div className="mt-2 space-y-2">
        {SUBJECTS.map((s) => (
          <Link key={s.id} to="/chapters" search={{ subject: s.id }} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-xl">{s.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{CHAPTERS.filter((c) => c.subject === s.id).length} chapters · Class 11 & 12</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
