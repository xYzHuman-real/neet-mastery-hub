import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { useStore, type Rating } from "../native/store";
import { loadContent } from "../native/content";
import { useEffect, useMemo, useState } from "react";

export default function Flashcards() {
  const { premium, due, mistakes, bookmarks, rate } = useStore();
  const [content, setContent] = useState<any[] | null>(null);
  const [deck, setDeck] = useState<"mistakes" | "due" | "bookmarks">("mistakes");
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (premium.active) loadContent().then(setContent);
  }, [premium.active]);

  const cards = useMemo(() => {
    if (!content) return [];
    const ids =
      deck === "mistakes"
        ? Object.keys(mistakes)
        : deck === "due"
          ? due
          : Object.keys(bookmarks);
    const by = new Map(content.map((q) => [q.id, q]));
    return ids.map((id) => by.get(id)).filter(Boolean);
  }, [content, deck, mistakes, due, bookmarks]);

  if (!premium.active) {
    return (
      <Shell title="Flashcards" subtitle="Premium feature">
        <Card>
          <Text style={{ fontSize: 20, fontWeight: "900", color: C.foreground }}>
            Premium access required
          </Text>
          <Text style={{ fontSize: 12, color: C.mutedText, marginTop: 7 }}>
            Unlock Flashcards from BuzNeet Premium.
          </Text>
          <Pressable
            onPress={() => router.push("/premium")}
            style={{ marginTop: 14, padding: 14, borderRadius: 15, backgroundColor: C.primary, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "900", color: C.primaryText }}>View Premium</Text>
          </Pressable>
        </Card>
      </Shell>
    );
  }

  if (!content) {
    return (
      <Shell title="Flashcards" subtitle="Active recall">
        <Text style={{ color: C.mutedText }}>Loading your revision decks…</Text>
      </Shell>
    );
  }

  const q = cards[i];

  return (
    <Shell
      title="Flashcards"
      subtitle="Active recall"
      right={
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: C.foreground }}>×</Text>
        </Pressable>
      }
    >
      <View style={{ flexDirection: "row", gap: 7 }}>
        {[
          ["mistakes", "Mistakes"],
          ["due", "Due"],
          ["bookmarks", "Saved"],
        ].map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => {
              setDeck(id as "mistakes" | "due" | "bookmarks");
              setI(0);
              setShown(false);
            }}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              backgroundColor: deck === id ? C.primary : C.card,
              borderWidth: 1,
              borderColor: deck === id ? C.primary : C.border,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "900",
                textAlign: "center",
                color: deck === id ? C.primaryText : C.foreground,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {!q ? (
        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: C.foreground }}>
            No cards here yet.
          </Text>
          <Text style={{ fontSize: 12, color: C.mutedText, marginTop: 6 }}>
            Answer questions, bookmark useful ones, and build your revision deck.
          </Text>
        </Card>
      ) : (
        <>
          <Text style={{ fontSize: 10, fontWeight: "900", color: C.primary, marginTop: 16 }}>
            {i + 1} / {cards.length}
          </Text>
          <Card style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", lineHeight: 25, color: C.foreground }}>
              {q.prompt}
            </Text>
            {shown && (
              <>
                <Text style={{ fontSize: 11, fontWeight: "900", color: C.primary, marginTop: 16 }}>
                  ANSWER
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: C.foreground, marginTop: 5 }}>
                  {q.options?.[q.answer]}
                </Text>
                {q.explanation && (
                  <Text style={{ fontSize: 12, lineHeight: 18, color: C.mutedText, marginTop: 8 }}>
                    {q.explanation}
                  </Text>
                )}
              </>
            )}
          </Card>

          {!shown && (
            <Pressable
              onPress={() => setShown(true)}
              style={{ marginTop: 12, padding: 15, borderRadius: 16, backgroundColor: C.primary, alignItems: "center" }}
            >
              <Text style={{ fontWeight: "900", color: C.primaryText }}>Reveal answer</Text>
            </Pressable>
          )}

          {shown && (
            <>
              <View style={{ flexDirection: "row", gap: 7, marginTop: 12 }}>
                {(["again", "hard", "good", "easy"] as Rating[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => rate(q.id, r)}
                    style={{ flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "900", textAlign: "center" }}>{r}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={() => {
                  rate(q.id, "good");
                  setShown(false);
                  setI((x) => x + 1);
                }}
                style={{ marginTop: 8, padding: 14, borderRadius: 15, backgroundColor: C.primary, alignItems: "center" }}
              >
                <Text style={{ fontWeight: "900", color: C.primaryText }}>
                  {i === cards.length - 1 ? "Finish deck" : "Next card"}
                </Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </Shell>
  );
}
