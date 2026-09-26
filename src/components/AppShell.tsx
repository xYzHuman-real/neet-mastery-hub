import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Home, BookOpen, NotebookPen, Timer, User } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chapters", label: "Chapters", icon: BookOpen },
  { to: "/mistakes", label: "Notebook", icon: NotebookPen },
  { to: "/tests", label: "Tests", icon: Timer },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden bg-background sm:h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-foreground sm:shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function AppShell({ title, subtitle, children, right }: { title: string; subtitle?: string; children: ReactNode; right?: ReactNode }) {
  const { hydrated, onboarded, user, telegramDone } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    if (!onboarded) navigate({ to: "/splash", replace: true });
    else if (!user) navigate({ to: "/login", replace: true });
    else if (!telegramDone) navigate({ to: "/telegram", replace: true });
  }, [hydrated, onboarded, user, telegramDone, navigate]);
  if (!hydrated || !onboarded || !user || !telegramDone) return <PhoneFrame><div className="flex-1" /></PhoneFrame>;
  return (
    <div className="min-h-screen bg-muted sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden bg-background sm:h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-foreground sm:shadow-2xl">
        <header className="flex items-end justify-between px-5 pb-3 pt-6">
          <div>
            {subtitle && <p className="text-xs font-semibold uppercase tracking-widest text-primary">{subtitle}</p>}
            <h1 className="font-display text-2xl font-bold leading-tight">{title}</h1>
          </div>
          {right}
        </header>
        <main className="flex-1 overflow-y-auto px-5 pb-28">{children}</main>
        <nav className="absolute inset-x-0 bottom-0 border-t bg-card/95 px-2 pb-4 pt-2 backdrop-blur">
          <ul className="flex justify-around">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-primary"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
