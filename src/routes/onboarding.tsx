import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — BuzNeet" },
      { name: "description", content: "Discover how BuzNeet helps you crack NEET with NCERT recall." },
      { property: "og:title", content: "Welcome — BuzNeet" },
      { property: "og:description", content: "Discover how BuzNeet helps you crack NEET." },
    ],
  }),
  component: Onboarding,
});

const SLIDES = [
  { icon: "📖", title: "Every NCERT line, mastered", text: "Line-by-line MCQs, fill-in-the-blanks, diagrams and A&R — straight from your textbook." },
  { icon: "🧠", title: "Never forget with smart revision", text: "Spaced repetition brings cards back on Day 1, 3, 7 and 30 so they stick." },
  { icon: "🎯", title: "Test like the real NEET", text: "Timed chapter tests with +4/−1 marking and a mistake notebook that fixes weak spots." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const { patch } = useStore();
  const navigate = useNavigate();
  const finish = () => { patch({ onboarded: true }); navigate({ to: "/login", replace: true }); };
  const s = SLIDES[i];
  return (
    <PhoneFrame>
      <div className="flex justify-end p-5">
        <button onClick={finish} className="text-sm font-semibold text-muted-foreground">Skip</button>
      </div>
      <div key={i} className="flex flex-1 animate-in fade-in slide-in-from-right-6 flex-col items-center justify-center px-8 text-center duration-500">
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-accent text-7xl">{s.icon}</div>
        <h2 className="mt-8 font-display text-2xl font-bold">{s.title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{s.text}</p>
      </div>
      <div className="p-6">
        <div className="mb-6 flex justify-center gap-2">
          {SLIDES.map((_, k) => <span key={k} className={cn("h-2 rounded-full transition-all", k === i ? "w-6 bg-primary" : "w-2 bg-muted")} />)}
        </div>
        <button onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : finish())} className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">
          {i < SLIDES.length - 1 ? "Next" : "Get started"}
        </button>
      </div>
    </PhoneFrame>
  );
}
