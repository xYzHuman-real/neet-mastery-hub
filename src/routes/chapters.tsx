import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CHAPTERS, MODES, QUESTIONS, SUBJECTS, type SubjectId } from "@/data/neet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chapters")({
  validateSearch: z.object({ subject: z.enum(["physics", "chemistry", "biology"]).optional() }),
  head: () => ({
    meta: [
      { title: "Chapters — NEET Recall" },
      { name: "description", content: "Browse NCERT chapters and pick a study mode: MCQs, fill-in-the-blanks, diagrams, A&R and PYQs." },
      { property: "og:title", content: "Chapters — NEET Recall" },
      { property: "og:description", content: "Browse NCERT chapters by subject with multiple study modes." },
    ],
  }),
  component: Chapters,
});

function Chapters() {
  const { subject } = Route.useSearch();
  const [sub, setSub] = useState<SubjectId>(subject ?? "biology");
  const [open, setOpen] = useState<string | null>(null);
  return (
    <AppShell title="Chapter Hub" subtitle="Browse">
      <div className="flex gap-2 rounded-2xl bg-muted p-1">
        {SUBJECTS.map((s) => (
          <button key={s.id} onClick={() => setSub(s.id)} className={cn("flex-1 rounded-xl py-2 text-sm font-semibold", sub === s.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}>{s.name}</button>
        ))}
      </div>
      {[11, 12].map((cls) => (
        <section key={cls} className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class {cls}</h2>
          <div className="mt-2 space-y-2">
            {CHAPTERS.filter((c) => c.subject === sub && c.classLevel === cls).map((c) => {
              const qs = QUESTIONS.filter((q) => q.chapterId === c.id);
              return (
                <div key={c.id} className="rounded-2xl border bg-card">
                  <button onClick={() => setOpen(open === c.id ? null : c.id)} className="w-full p-4 text-left">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.totalLines} NCERT lines · {qs.length} questions</p>
                  </button>
                  {open === c.id && (
                    <div className="grid grid-cols-2 gap-2 border-t p-3">
                      {MODES.map((m) => {
                        const n = qs.filter((q) => q.mode === m.id).length;
                        return (
                          <Link key={m.id} to="/practice" search={{ chapter: c.id, mode: m.id }} disabled={!n}
                            className={cn("rounded-xl bg-accent p-3", !n && "pointer-events-none opacity-40")}>
                            <p className="text-sm font-semibold text-primary">{m.label}</p>
                            <p className="text-[11px] text-muted-foreground">{n} Qs · {m.desc}</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
