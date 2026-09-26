import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CHAPTERS, QUESTIONS, type Question } from "@/data/neet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Chapter Tests — NEET Recall" },
      { name: "description", content: "Timed NEET chapter tests with +4/-1 marking, accuracy and time analysis." },
      { property: "og:title", content: "Chapter Tests — NEET Recall" },
      { property: "og:description", content: "Timed NEET practice tests with standard marking and analytics." },
    ],
  }),
  component: Tests,
});

type Ans = { pick: number | null; time: number };

function Tests() {
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<Ans[]>([]);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const qStart = useRef(Date.now());

  useEffect(() => {
    if (!qs || done) return;
    const t = setInterval(() => setLeft((l) => { if (l <= 1) { setDone(true); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [qs, done]);

  const start = (chapterId?: string) => {
    const pool = QUESTIONS.filter((q) => q.options && (!chapterId || CHAPTERS.find((c) => c.id === q.chapterId)?.subject === chapterId));
    setQs(pool); setAns(pool.map(() => ({ pick: null, time: 0 }))); setI(0); setLeft(pool.length * 60); setDone(false); qStart.current = Date.now();
  };
  const go = (n: number) => {
    setAns((a) => a.map((x, k) => (k === i ? { ...x, time: x.time + (Date.now() - qStart.current) / 1000 } : x)));
    qStart.current = Date.now();
    if (n >= (qs?.length ?? 0)) setDone(true); else setI(n);
  };

  if (!qs) return (
    <AppShell title="Chapter Tests" subtitle="Timed · +4 / −1">
      <p className="text-sm text-muted-foreground">1 minute per question. Correct +4, wrong −1, unattempted 0.</p>
      <div className="mt-4 space-y-2">
        {[{ id: undefined, n: "Full Mixed Test" }, { id: "biology", n: "Biology Test" }, { id: "chemistry", n: "Chemistry Test" }, { id: "physics", n: "Physics Test" }].map((t) => (
          <button key={t.n} onClick={() => start(t.id)} className="w-full rounded-2xl border bg-card p-4 text-left">
            <p className="font-semibold">{t.n}</p>
            <p className="text-xs text-muted-foreground">{QUESTIONS.filter((q) => q.options && (!t.id || CHAPTERS.find((c) => c.id === q.chapterId)?.subject === t.id)).length} questions</p>
          </button>
        ))}
      </div>
    </AppShell>
  );

  if (done) {
    const correct = ans.filter((a, k) => a.pick === qs[k].answer).length;
    const wrong = ans.filter((a, k) => a.pick !== null && a.pick !== qs[k].answer).length;
    const attempted = correct + wrong;
    const score = correct * 4 - wrong;
    const totalTime = ans.reduce((s, a) => s + a.time, 0);
    const maxT = Math.max(1, ...ans.map((a) => a.time));
    return (
      <AppShell title="Test Analysis" subtitle="Results">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
          <p className="text-xs opacity-80">Score</p>
          <p className="font-display text-4xl font-bold">{score}<span className="text-lg opacity-70">/{qs.length * 4}</span></p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat v={`${attempted ? Math.round((correct / attempted) * 100) : 0}%`} l="Accuracy" />
          <Stat v={`${correct}/${wrong}`} l="Right/Wrong" />
          <Stat v={`${Math.round(totalTime / Math.max(1, attempted))}s`} l="Avg / Q" />
        </div>
        <h2 className="mt-5 font-display font-bold">Time per question</h2>
        <div className="mt-2 space-y-1.5">
          {qs.map((q, k) => {
            const ok = ans[k].pick === q.answer, skip = ans[k].pick === null;
            return (
              <div key={q.id} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-muted-foreground">Q{k + 1}</span>
                <div className="h-3 flex-1 rounded-full bg-muted"><div className={cn("h-full rounded-full", skip ? "bg-muted-foreground/40" : ok ? "bg-success" : "bg-destructive")} style={{ width: `${(ans[k].time / maxT) * 100}%` }} /></div>
                <span className="w-10 text-right">{Math.round(ans[k].time)}s</span>
              </div>
            );
          })}
        </div>
        <button onClick={() => setQs(null)} className="mt-5 w-full rounded-2xl border py-3 text-sm font-semibold">Back to tests</button>
      </AppShell>
    );
  }

  const q = qs[i];
  return (
    <AppShell title={`Question ${i + 1}/${qs.length}`} subtitle="Timed test"
      right={<span className={cn("rounded-full px-3 py-1 font-mono text-sm font-bold", left < 30 ? "bg-destructive text-destructive-foreground" : "bg-accent text-primary")}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>}>
      <div className="rounded-3xl border bg-card p-5">
        <p className="whitespace-pre-line font-display text-lg font-semibold">{q.prompt}</p>
      </div>
      <div className="mt-3 space-y-2">
        {q.options!.map((o, k) => (
          <button key={k} onClick={() => setAns((a) => a.map((x, j) => (j === i ? { ...x, pick: x.pick === k ? null : k } : x)))}
            className={cn("w-full rounded-2xl border bg-card px-4 py-3 text-left text-sm", ans[i].pick === k && "border-primary bg-accent")}>
            <span className="mr-2 font-semibold text-muted-foreground">{String.fromCharCode(65 + k)}.</span>{o}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button disabled={i === 0} onClick={() => go(i - 1)} className="flex-1 rounded-2xl border py-3 text-sm font-semibold disabled:opacity-40">Prev</button>
        <button onClick={() => go(i + 1)} className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">{i === qs.length - 1 ? "Submit" : "Next"}</button>
      </div>
    </AppShell>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return <div className="rounded-2xl border bg-card p-3"><p className="font-display text-lg font-bold">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>;
}
