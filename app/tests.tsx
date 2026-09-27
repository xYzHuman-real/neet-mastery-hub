import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { loadContent, CHAPTERS } from "../native/content";
import { useStore } from "../native/store";

export default function Tests() {
  const [qs, setQs] = useState<any[]>([]);
  const [content, setContent] = useState<any[] | null>(null);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [left, setLeft] = useState(0);
  const [started, setStarted] = useState(0);
  const [done, setDone] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [subject, setSubject] = useState<string | undefined>();
  const [count, setCount] = useState(45);
  const { saveTest, premium } = useStore();

  const start = (sub?: string, n = count, minutes = n) => {
    const pool = (content ?? []).filter(
      q =>
        q.options?.length &&
        (!sub || CHAPTERS.find(c => c.id === q.chapterId)?.subject === sub)
    );
    const a = [...pool].sort(() => Math.random() - 0.5).slice(0, n);
    if (a.length < n) return;
    setQs(a);
    setPicks(a.map(() => null));
    setI(0);
    setLeft(minutes * 60);
    setStarted(Date.now());
    setDone(false);
  };

  useEffect(() => {
    loadContent().then(setContent).catch(() => setContentError(true));
  }, []);

  useEffect(() => {
    if (!qs.length || done) return;
    const t = setInterval(
      () =>
        setLeft(x => {
          if (x <= 1) {
            setDone(true);
            return 0;
          }
          return x - 1;
        }),
      1000
    );
    return () => clearInterval(t);
  }, [qs.length, done]);

  if (contentError)
    return (
      <Shell title="Tests unavailable" subtitle="BuzNeet">
        <Text style={{ fontSize: 14, color: C.mutedText }}>
          The question bank could not be loaded.
        </Text>
      </Shell>
    );

  if (!content)
    return (
      <Shell title="Loading tests" subtitle="BuzNeet">
        <Text style={{ fontSize: 14, color: C.mutedText }}>
          Preparing the test bank…
        </Text>
      </Shell>
    );

  if (!qs.length)
    return (
      <Shell title="Tests" subtitle="Timed · +4 / −1">
        <Text style={{ fontSize: 13, color: C.mutedText }}>
          Choose a test or build a custom one. Correct +4 · wrong −1 · skipped 0.
          Detailed reports are included with Premium.
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "900",
            color: C.foreground,
            marginTop: 20,
          }}
        >
          Quick tests
        </Text>

        <View style={{ gap: 8, marginTop: 10 }}>
          {[
            [undefined, "Full NEET Mock", 180, 180],
            ["biology", "Biology Test", 45, 45],
            ["chemistry", "Chemistry Test", 45, 45],
            ["physics", "Physics Test", 45, 45],
          ].map(([id, title, n, minutes]) => (
            <Pressable
              key={String(title)}
              onPress={() =>
                start(id as string | undefined, n as number, minutes as number)
              }
              style={{
                padding: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: C.border,
                backgroundColor: C.card,
              }}
            >
              <Text style={{ fontWeight: "800", color: C.foreground }}>
                {title}
              </Text>
              <Text style={{ fontSize: 11, color: C.mutedText, marginTop: 3 }}>
                {n} questions · {minutes} minutes
              </Text>
            </Pressable>
          ))}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "900",
            color: C.foreground,
            marginTop: 20,
          }}
        >
          Custom Test {premium.active ? "" : "· Premium"}
        </Text>

        <Card style={{ marginTop: 10, opacity: premium.active ? 1 : 0.55 }}>
          <Text style={{ fontSize: 11, fontWeight: "900", color: C.primary }}>
            SUBJECT
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 7,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            {[
              ["mixed", "All"],
              ["physics", "Physics"],
              ["chemistry", "Chemistry"],
              ["biology", "Biology"],
            ].map(([id, title]) => {
              const active = (id === "mixed" && !subject) || subject === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setSubject(id === "mixed" ? undefined : id)}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? C.primary : C.border,
                    backgroundColor: active ? C.accent : C.card,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800" }}>
                    {title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            style={{
              fontSize: 11,
              fontWeight: "900",
              color: C.primary,
              marginTop: 16,
            }}
          >
            QUESTIONS
          </Text>

          <View style={{ flexDirection: "row", gap: 7, marginTop: 8 }}>
            {[10, 20, 30, 45].map(n => (
              <Pressable
                key={n}
                onPress={() => setCount(n)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: count === n ? C.primary : C.border,
                  backgroundColor: count === n ? C.accent : C.card,
                }}
              >
                <Text style={{ textAlign: "center", fontWeight: "800" }}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            disabled={!premium.active}
            onPress={() => start(subject, count, count)}
            style={{
              marginTop: 14,
              backgroundColor: premium.active ? C.primary : C.muted,
              borderRadius: 15,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "900",
                color: premium.active ? C.primaryText : C.mutedText,
              }}
            >
              {premium.active ? "Start Custom Test" : "Premium Required"}
            </Text>
          </Pressable>
        </Card>
      </Shell>
    );

  if (done) {
    const correct = picks.filter((x, k) => x === qs[k].answer).length;
    const wrong = picks.filter(
      (x, k) => x !== null && x !== qs[k].answer
    ).length;
    const skipped = qs.length - correct - wrong;
    const elapsed = Math.max(
      1,
      Math.round((Date.now() - started) / 1000)
    );

    return (
      <Shell title="Test Review" subtitle="Completed">
        <Card style={{ backgroundColor: C.primary, borderColor: C.primary }}>
          <Text style={{ fontSize: 11, color: C.primaryText }}>SCORE</Text>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "900",
              color: C.primaryText,
            }}
          >
            {correct * 4 - wrong}
            <Text style={{ fontSize: 17 }}> / {qs.length * 4}</Text>
          </Text>
        </Card>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontWeight: "900" }}>{correct}</Text>
            <Text style={{ fontSize: 10, color: C.mutedText }}>Correct</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontWeight: "900" }}>{wrong}</Text>
            <Text style={{ fontSize: 10, color: C.mutedText }}>Wrong</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontWeight: "900" }}>{skipped}</Text>
            <Text style={{ fontSize: 10, color: C.mutedText }}>Skipped</Text>
          </Card>
        </View>

        <Pressable
          onPress={() => {
            saveTest({
              id: String(Date.now()),
              title: "Timed Test",
              subject: subject || "mixed",
              total: qs.length,
              score: correct * 4 - wrong,
              accuracy: Math.round((correct / qs.length) * 100),
              correct,
              wrong,
              skipped,
              timeSec: elapsed,
              at: Date.now(),
            });
            setQs([]);
            setDone(false);
          }}
          style={{
            marginTop: 16,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 16,
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Back to tests</Text>
        </Pressable>
      </Shell>
    );
  }

  const q = qs[i];

  return (
    <Shell
      title={`Question ${i + 1}/${qs.length}`}
      subtitle="Timed test"
      right={
        <Text
          style={{
            fontWeight: "800",
            color: left < 60 ? C.destructive : C.primary,
          }}
        >
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </Text>
      }
    >
      <Card>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            lineHeight: 25,
            color: C.foreground,
          }}
        >
          {q.prompt}
        </Text>
      </Card>

      <View style={{ gap: 8, marginTop: 12 }}>
        {q.options.map((o: any, k: number) => (
          <Pressable
            key={k}
            onPress={() =>
              setPicks(a =>
                a.map((x, j) => (j === i ? (x === k ? null : k) : x))
              )
            }
            style={{
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: picks[i] === k ? C.primary : C.border,
              backgroundColor: picks[i] === k ? C.accent : C.card,
            }}
          >
            <Text style={{ fontSize: 13, color: C.foreground }}>
              {String.fromCharCode(65 + k)}. {o}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
        <Pressable
          disabled={i === 0}
          onPress={() => setI(i - 1)}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 16,
            padding: 13,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Prev</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            i === qs.length - 1 ? setDone(true) : setI(i + 1)
          }
          style={{
            flex: 1,
            backgroundColor: C.primary,
            borderRadius: 16,
            padding: 13,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700", color: C.primaryText }}>
            {i === qs.length - 1 ? "Submit" : "Next"}
          </Text>
        </Pressable>
      </View>
    </Shell>
  );
}
