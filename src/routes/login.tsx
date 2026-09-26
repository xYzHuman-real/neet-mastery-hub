import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — BuzNeet" },
      { name: "description", content: "Log in to BuzNeet to continue your NEET preparation." },
      { property: "og:title", content: "Log in — BuzNeet" },
      { property: "og:description", content: "Log in to continue your NEET preparation." },
    ],
  }),
  component: Login,
});

function Login() {
  const { patch } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/\S+@\S+\.\S+/.test(email) || pw.length < 6) return setErr("Enter your name, a valid email and a 6+ character password.");
    patch({ user: { name: name.trim(), email }, onboarded: true });
    navigate({ to: "/telegram", replace: true });
  };
  const field = "w-full rounded-2xl border bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring";
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col justify-center px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-highlight font-display text-2xl font-bold text-highlight-foreground">B</div>
        <h1 className="mt-6 font-display text-3xl font-bold">Welcome to BuzNeet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to track your NCERT mastery.</p>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input className={field} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={field} type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground">Log in</button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to BuzNeet's Terms & Privacy Policy.</p>
      </div>
    </PhoneFrame>
  );
}
