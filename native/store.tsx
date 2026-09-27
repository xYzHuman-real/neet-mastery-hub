import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutFirebase, watchFirebaseUser } from "./firebaseAuth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Rating = "again" | "hard" | "good" | "easy";

type S = {
  streak: number;
  todayCount: number;
  goal: number;
  answered: Record<string, boolean>;
  cards: Record<string, { step: number; due: number }>;
  mistakes: Record<string, { qid: string; at: number; flagged: boolean }>;
  user: { name: string; email: string } | null;
  onboarded: boolean;
  telegramDone: boolean;
};

const D = 86400000;

const initial: S = {
  streak: 12,
  todayCount: 18,
  goal: 50,
  answered: {
    q1: true,
    q6: true,
    q9: true,
    q11: false,
    q15: true,
    q3: false,
    q13: false,
  },
  cards: {
    q1: { step: 0, due: Date.now() - 1000 },
    q6: { step: 1, due: Date.now() - 1000 },
    q9: { step: 2, due: Date.now() - 1000 },
    q15: { step: 3, due: Date.now() + 10 * D },
    q11: { step: 0, due: Date.now() - 1000 },
  },
  mistakes: {
    q11: { qid: "q11", at: Date.now() - 7200000, flagged: false },
    q3: { qid: "q3", at: Date.now() - D, flagged: false },
    q13: { qid: "q13", at: Date.now() - 3 * D, flagged: true },
  },
  user: null,
  onboarded: false,
  telegramDone: false,
};

type Ctx = S & {
  hydrated: boolean;
  patch: (p: Partial<S>) => void;
  logout: () => Promise<void>;
  record: (id: string, ok: boolean) => void;
  rate: (id: string, r: Rating) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  due: string[];
};

const Ctx = createContext<Ctx | null>(null);
const KEY = "buzneet-native-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState(initial);
  const [hydrated, setH] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((x) => {
        if (x) {
          try {
            setS({ ...initial, ...JSON.parse(x) });
          } catch {}
        }
      })
      .finally(() => setH(true));
  }, []);

  useEffect(() => {
    const unsubscribe = watchFirebaseUser((user) => {
      if (!user) {
        setS((x) => ({ ...x, user: null }));
        return;
      }

      setS((x) => ({
        ...x,
        user: {
          name: user.displayName || "NEET Aspirant",
          email: user.email || "",
        },
        onboarded: true,
      }));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(KEY, JSON.stringify(s));
    }
  }, [s, hydrated]);

  const v = useMemo<Ctx>(
    () => ({
      ...s,
      hydrated,
      patch: (p) => setS((x) => ({ ...x, ...p })),
      logout: async () => {
        await logoutFirebase();
        setS((x) => ({ ...x, user: null, telegramDone: false }));
      },
      record: (id, ok) =>
        setS((x) => ({
          ...x,
          todayCount: x.todayCount + 1,
          answered: { ...x.answered, [id]: ok },
          mistakes: ok
            ? x.mistakes
            : {
                ...x.mistakes,
                [id]: {
                  qid: id,
                  at: Date.now(),
                  flagged: x.mistakes[id]?.flagged ?? false,
                },
              },
        })),
      rate: (id, r) =>
        setS((x) => {
          const cur = x.cards[id]?.step ?? -1;
          const step =
            r === "again"
              ? 0
              : r === "hard"
                ? Math.max(0, cur)
                : Math.min(3, cur + 1);

          return {
            ...x,
            cards: {
              ...x.cards,
              [id]: {
                step,
                due: Date.now() + [1, 3, 7, 30][step] * D,
              },
            },
          };
        }),
      toggle: (id) =>
        setS((x) => {
          const m = { ...x.mistakes };
          if (m[id]?.flagged) delete m[id];
          else m[id] = { qid: id, at: Date.now(), flagged: true };
          return { ...x, mistakes: m };
        }),
      remove: (id) =>
        setS((x) => {
          const m = { ...x.mistakes };
          delete m[id];
          return { ...x, mistakes: m };
        }),
      due: Object.entries(s.cards)
        .filter(([, c]) => c.due <= Date.now())
        .map(([id]) => id),
    }),
    [s, hydrated],
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useStore() {
  const x = useContext(Ctx);
  if (!x) throw new Error("StoreProvider missing");
  return x;
}
