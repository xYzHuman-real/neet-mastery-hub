import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Flag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { chapterById, questionById } from "@/data/neet";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mistakes")({
  head: () => ({
    meta: [
      { title: "Mistake Notebook — NEET Recall" },
      { name: "description", content: "An automated revision queue of missed and flagged NEET questions." },
      { property: "og:title", content: "Mistake Notebook — NEET Recall" },
      { property: "og:description", content: "Revise missed and flagged questions with spaced repetition." },
    ],
  }),
  component: Mistakes,
});

const DIFFS = ["all", "easy", "medium", "hard"] as const;

function Mistakes() {
  const { mistakes, removeMistake } = useStore();
  const [recent, setRecent] = useState(false);
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("all");
  const list = Object.values(mistakes)
    .filter((m) => !recent || Date.now() - m.at < 86400000 * 2)
    .filter((m) => diff === "all" || questionById(m.qid)?.difficulty === diff)
    .sort((a, b) => b.at - a.at);

  return (
    <AppShell title="Mistake Notebook" subtitle={`${Object.keys(mistakes).length} in queue`}>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setRecent(!recent)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", recent && "border-primary bg-primary text-primary-foreground")}>Recent (48h)</button>
        {DIFFS.map((d) => (
          <button key={d} onClick={() => setDiff(d)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize", diff === d && "border-primary bg-accent text-primary")}>{d}</button>
        ))}
      </div>
      {list.length > 0 && (
        <Link to="/practice" search={{ mistakes: true }} className="mt-4 block rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">Revise all {Object.keys(mistakes).length}</Link>
      )}
      <div className="mt-4 space-y-2">
        {list.map((m) => {
          const q = questionById(m.qid)!;
          return (
            <div key={m.qid} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">{m.flagged ? <><Flag className="h-3 w-3 text-highlight-foreground" /> Flagged</> : "Missed"} · {chapterById(q.chapterId)?.name}</span>
                <button aria-label="Remove" onClick={() => removeMistake(m.qid)}><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-1 whitespace-pre-line text-sm font-medium">{q.prompt}</p>
              <p className="mt-2 text-xs text-muted-foreground">{q.citation.book} · p.{q.citation.page} · <span className="capitalize">{q.difficulty}</span></p>
            </div>
          );
        })}
        {!list.length && <p className="py-10 text-center text-sm text-muted-foreground">No mistakes match these filters.</p>}
      </div>
    </AppShell>
  );
}
