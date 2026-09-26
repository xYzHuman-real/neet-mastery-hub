import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/AppShell";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "BuzNeet" },
      { name: "description", content: "BuzNeet — NCERT line-by-line NEET preparation." },
      { property: "og:title", content: "BuzNeet" },
      { property: "og:description", content: "NCERT line-by-line NEET preparation." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding", replace: true }), 2200);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center bg-primary text-primary-foreground">
        <div className="flex h-24 w-24 animate-in zoom-in items-center justify-center rounded-[2rem] bg-highlight font-display text-5xl font-bold text-highlight-foreground duration-700">B</div>
        <h1 className="mt-5 animate-in fade-in slide-in-from-bottom-4 font-display text-4xl font-bold duration-700">BuzNeet</h1>
        <p className="mt-1 text-sm opacity-80">Master every NCERT line</p>
        <div className="mt-10 h-1 w-24 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-highlight" />
        </div>
      </div>
    </PhoneFrame>
  );
}
