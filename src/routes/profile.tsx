import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flame, Target, NotebookPen, Send, LogOut, ChevronRight, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — BuzNeet" },
      { name: "description", content: "Your BuzNeet profile, stats and settings." },
      { property: "og:title", content: "Profile — BuzNeet" },
      { property: "og:description", content: "Your BuzNeet profile and study stats." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, streak, answered, mistakes, goal, logout } = useStore();
  const navigate = useNavigate();
  const done = Object.keys(answered).length;
  const correct = Object.values(answered).filter(Boolean).length;
  return (
    <AppShell title="Profile" subtitle="Account">
      <div className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-highlight font-display text-2xl font-bold text-highlight-foreground">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-xl font-bold">{user?.name}</p>
          <p className="text-xs opacity-80">{user?.email}</p>
          <p className="mt-1 text-xs font-semibold">NEET 2027 aspirant</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[{ i: Flame, v: streak, l: "Streak" }, { i: Target, v: done ? `${Math.round((correct / done) * 100)}%` : "0%", l: "Accuracy" }, { i: NotebookPen, v: Object.keys(mistakes).length, l: "Mistakes" }].map(({ i: I, v, l }) => (
          <div key={l} className="rounded-2xl border bg-card p-3"><I className="mx-auto h-4 w-4 text-primary" /><p className="mt-1 font-display text-lg font-bold">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <div className="mt-4 divide-y rounded-2xl border bg-card">
        <Link to="/practice" className="flex items-center gap-3 p-4 text-sm font-medium"><Zap className="h-4 w-4 text-primary" /><span className="flex-1">Mixed practice</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
        <div className="flex items-center gap-3 p-4 text-sm font-medium"><Target className="h-4 w-4 text-primary" /><span className="flex-1">Daily goal</span><span className="text-muted-foreground">{goal} lines</span></div>
        <a href="https://t.me/buzneet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 text-sm font-medium"><Send className="h-4 w-4 text-primary" /><span className="flex-1">Telegram community</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></a>
      </div>
      <button onClick={() => { logout(); navigate({ to: "/login", replace: true }); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 py-3 text-sm font-semibold text-destructive">
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </AppShell>
  );
}
