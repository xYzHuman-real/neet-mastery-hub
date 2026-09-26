import { useState } from "react";
import { Bookmark, BookmarkCheck, Quote } from "lucide-react";
import { chapterById, MODES, type Question } from "@/data/neet";
import { useStore, type Rating } from "@/lib/store";
import { cn } from "@/lib/utils";

export function QuestionCard({ q, onNext }: { q: Question; onNext: () => void }) {
  const { record, rate, toggleMistake, mistakes } = useStore();
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const flagged = !!mistakes[q.id]?.flagged;

  const correct = q.options ? picked === q.answer : text.trim().toLowerCase().replace(/\s/g, "") === String(q.answer).toLowerCase().replace(/\s/g, "");

  const check = (idx?: number) => {
    if (revealed) return;
    if (idx !== undefined) setPicked(idx);
    const ok = q.options ? idx === q.answer : correct;
    setRevealed(true);
    record(q.id, ok);
  };
  const doRate = (r: Rating) => { rate(q.id, r); setPicked(null); setText(""); setRevealed(false); onNext(); };
  const mode = MODES.find((m) => m.id === q.mode)!;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-primary">{mode.short}</span>
            {q.pyqYear && <span className="rounded-full bg-highlight px-2.5 py-0.5 text-[11px] font-semibold text-highlight-foreground">NEET {q.pyqYear}</span>}
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] capitalize text-muted-foreground">{q.difficulty}</span>
          </div>
          <button aria-label="Save to Mistake Notebook" onClick={() => toggleMistake(q.id)} className="text-primary">
            {flagged ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{chapterById(q.chapterId)?.name}</p>
        <p className="mt-2 whitespace-pre-line font-display text-lg font-semibold leading-snug">{q.prompt}</p>
      </div>

      {q.options ? (
        <div className="space-y-2">
          {q.options.map((o, i) => (
            <button
              key={i}
              onClick={() => check(i)}
              className={cn(
                "w-full rounded-2xl border bg-card px-4 py-3 text-left text-sm transition",
                revealed && i === q.answer && "border-success bg-success/10",
                revealed && picked === i && i !== q.answer && "border-destructive bg-destructive/10",
                !revealed && "active:scale-[0.98]",
              )}
            >
              <span className="mr-2 font-semibold text-muted-foreground">{String.fromCharCode(65 + i)}.</span>{o}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} disabled={revealed} placeholder="Type the missing word"
            className="flex-1 rounded-2xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={() => check()} disabled={revealed} className="rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">Check</button>
        </div>
      )}

      {revealed && (
        <>
          <div className={cn("rounded-2xl p-4", correct ? "bg-success/10" : "bg-destructive/10")}>
            <p className={cn("text-sm font-bold", correct ? "text-success" : "text-destructive")}>
              {correct ? "Correct!" : `Answer: ${q.options ? q.options[q.answer as number] : q.answer}`}
            </p>
            <div className="mt-3 rounded-xl border-l-4 border-primary bg-card p-3">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary"><Quote className="h-3 w-3" />{q.citation.book} · Page {q.citation.page}</p>
              <p className="mt-1 text-sm italic">“{q.citation.line}”</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => doRate("forgot")} className="rounded-2xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground">Forgot<span className="block text-[10px] opacity-80">1 day</span></button>
            <button onClick={() => doRate("hard")} className="rounded-2xl bg-highlight py-3 text-sm font-semibold text-highlight-foreground">Hard<span className="block text-[10px] opacity-80">3 days</span></button>
            <button onClick={() => doRate("easy")} className="rounded-2xl bg-success py-3 text-sm font-semibold text-success-foreground">Easy<span className="block text-[10px] opacity-80">7+ days</span></button>
          </div>
        </>
      )}
    </div>
  );
}
