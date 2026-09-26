import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PhoneFrame } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/telegram")({
  head: () => ({
    meta: [
      { title: "Join our Telegram — BuzNeet" },
      { name: "description", content: "Join the BuzNeet Telegram community for daily NEET updates and tips." },
      { property: "og:title", content: "Join our Telegram — BuzNeet" },
      { property: "og:description", content: "Daily NEET updates, tips and doubt-solving on Telegram." },
    ],
  }),
  component: Telegram,
});

const TG = "https://t.me/buzneet";

function Telegram() {
  const { patch } = useStore();
  const navigate = useNavigate();
  const next = () => { patch({ telegramDone: true }); navigate({ to: "/", replace: true }); };
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent">
          <Send className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold">Join the Telegram</h1>
        <p className="mt-3 text-sm text-muted-foreground">Get daily NCERT questions, NEET updates, toppers' tips and quick doubt-solving in the BuzNeet community.</p>
        <p className="mt-2 text-sm font-semibold text-primary">t.me/buzneet</p>
      </div>
      <div className="space-y-3 p-6">
        <a href={TG} target="_blank" rel="noopener noreferrer" onClick={next} className="block w-full rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground">Join Telegram</a>
        <button onClick={next} className="w-full py-2 text-sm font-semibold text-muted-foreground">Maybe later</button>
      </div>
    </PhoneFrame>
  );
}
