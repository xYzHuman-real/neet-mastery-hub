import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QUESTIONS, SRS_INTERVALS } from "@/data/neet";

export type Rating = "easy" | "hard" | "forgot";

interface CardState {
  step: number; // index into SRS_INTERVALS
  due: number; // timestamp
  lastRating?: Rating;
}
interface Mistake {
  qid: string;
  at: number;
  flagged: boolean;
}
interface State {
  streak: number;
  todayCount: number;
  goal: number;
  answered: Record<string, boolean>; // qid -> correct last time
  cards: Record<string, CardState>;
  mistakes: Record<string, Mistake>;
  user: { name: string; email: string } | null;
  onboarded: boolean;
  telegramDone: boolean;
}

const DAY = 86400000;
const now = Date.now();
const seed: State = {
  streak: 12,
  todayCount: 18,
  goal: 50,
  answered: { q1: true, q6: true, q9: true, q11: false, q15: true, q3: false, q13: false },
  cards: {
    q1: { step: 0, due: now - 1000 },
    q6: { step: 1, due: now - 1000 },
    q9: { step: 2, due: now - 1000 },
    q15: { step: 3, due: now + 10 * DAY },
    q11: { step: 0, due: now - 1000 },
  },
  user: null,
  onboarded: false,
  telegramDone: false,
  mistakes: {
    q11: { qid: "q11", at: now - 2 * 3600000, flagged: false },
    q3: { qid: "q3", at: now - DAY, flagged: false },
    q13: { qid: "q13", at: now - 3 * DAY, flagged: true },
  },
};

interface Ctx extends State {
  record: (qid: string, correct: boolean) => void;
  rate: (qid: string, r: Rating) => void;
  toggleMistake: (qid: string) => void;
  removeMistake: (qid: string) => void;
  dueToday: string[];
  hydrated: boolean;
  patch: (p: Partial<State>) => void;
  logout: () => void;
}
const StoreCtx = createContext<Ctx | null>(null);
const KEY = "buzneet-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(seed);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) try { setS({ ...seed, ...JSON.parse(raw) }); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(s)); }, [s, hydrated]);
  const patch = (p: Partial<State>) => setS((o) => ({ ...o, ...p }));
  const logout = () => setS((o) => ({ ...o, user: null, telegramDone: false }));

  const record = (qid: string, correct: boolean) =>
    setS((p) => ({
      ...p,
      todayCount: p.todayCount + 1,
      answered: { ...p.answered, [qid]: correct },
      mistakes: correct ? p.mistakes : { ...p.mistakes, [qid]: { qid, at: Date.now(), flagged: p.mistakes[qid]?.flagged ?? false } },
    }));
  const rate = (qid: string, r: Rating) =>
    setS((p) => {
      const cur = p.cards[qid]?.step ?? -1;
      const step = r === "forgot" ? 0 : r === "hard" ? Math.max(0, cur) : Math.min(SRS_INTERVALS.length - 1, cur + 1);
      return { ...p, cards: { ...p.cards, [qid]: { step, due: Date.now() + SRS_INTERVALS[step] * DAY, lastRating: r } } };
    });
  const toggleMistake = (qid: string) =>
    setS((p) => {
      const m = { ...p.mistakes };
      if (m[qid]?.flagged) delete m[qid];
      else m[qid] = { qid, at: Date.now(), flagged: true };
      return { ...p, mistakes: m };
    });
  const removeMistake = (qid: string) =>
    setS((p) => { const m = { ...p.mistakes }; delete m[qid]; return { ...p, mistakes: m }; });

  const dueToday = Object.entries(s.cards).filter(([, c]) => c.due <= Date.now()).map(([id]) => id)
    .filter((id) => QUESTIONS.some((q) => q.id === id));

  return <StoreCtx.Provider value={{ ...s, record, rate, toggleMistake, removeMistake, dueToday, hydrated, patch, logout }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}
