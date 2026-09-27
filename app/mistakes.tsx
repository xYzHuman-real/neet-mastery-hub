import { useState, useEffect } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Shell } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";
import { loadContent, chapterById } from "../native/content";

export default function Mistakes() {
  const { mistakes, remove, bookmarks, toggleBookmark } = useStore();
  const [content, setContent] = useState<any[] | null>(null);
  const [contentError, setContentError] = useState(false);
  const [recent, setRecent] = useState(false);

  useEffect(() => {
    loadContent().then(setContent).catch(() => setContentError(true));
  }, []);

  if (contentError) {
    return (
      <Shell title="Notebook unavailable" subtitle="BuzNeet">
        <Text style={{ fontSize: 14, color: C.mutedText }}>
          The question bank could not be loaded.
        </Text>
      </Shell>
    );
  }

  if (!content) {
    return (
      <Shell title="Mistake Notebook" subtitle="Loading">
        <Text style={{ fontSize: 14, color: C.mutedText }}>
          Preparing your notebook…
        </Text>
      </Shell>
    );
  }

  const list = Object.values(mistakes)
    .filter((m: any) => !recent || Date.now() - m.at < 172800000)
    .sort((a: any, b: any) => b.at - a.at);
  const saved = Object.keys(bookmarks);

  return (
    <Shell
      title="Mistake Notebook"
      subtitle={Object.keys(mistakes).length + " in queue"}
    >
      <Pressable
        onPress={() => setRecent(!recent)}
        style={{
          alignSelf: "flex-start",
          borderWidth: 1,
          borderColor: recent ? C.primary : C.border,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 7,
          backgroundColor: recent ? C.accent : C.card,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700" }}>Recent (48h)</Text>
      </Pressable>

      {list.length > 0 && (
        <Link href={{ pathname: "/practice", params: { mistakes: "1" } }} asChild>
          <Pressable
            style={{
              marginTop: 12,
              backgroundColor: C.primary,
              borderRadius: 16,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "800", color: C.primaryText }}>
              Revise all {Object.keys(mistakes).length}
            </Text>
          </Pressable>
        </Link>
      )}

      <View style={{ gap: 8, marginTop: 12 }}>
        {list.map((m: any) => {
          const q = content.find((x: any) => x.id === m.qid);
          if (!q) return null;

          return (
            <View
              key={m.qid}
              style={{
                padding: 15,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: C.border,
                backgroundColor: C.card,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 10, color: C.mutedText }}>
                  {m.flagged ? "🔖 Flagged" : "Missed"} ·{" "}
                  {chapterById(q.chapterId)?.name}
                </Text>
                <Pressable onPress={() => remove(m.qid)}>
                  <Text style={{ fontSize: 16 }}>×</Text>
                </Pressable>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: C.foreground,
                  marginTop: 5,
                }}
              >
                {q.prompt}
              </Text>

              <Text style={{ fontSize: 10, color: C.mutedText, marginTop: 6 }}>
                {q.citation.book} · p.{q.citation.page} · {q.difficulty}
              </Text>
            </View>
          );
        })}

        <Text
          style={{
            fontSize: 17,
            fontWeight: "900",
            color: C.foreground,
            marginTop: 20,
          }}
        >
          Bookmarks
        </Text>

        <View style={{ gap: 8, marginTop: 8 }}>
          {saved.length ? (
            content
              .filter((q: any) => bookmarks[q.id])
              .slice(0, 12)
              .map((q: any) => (
                <View
                  key={q.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: C.border,
                    backgroundColor: C.card,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color: C.foreground,
                    }}
                  >
                    {q.prompt}
                  </Text>
                  <Pressable onPress={() => toggleBookmark(q.id)}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: C.primary,
                        marginTop: 6,
                      }}
                    >
                      Remove bookmark
                    </Text>
                  </Pressable>
                </View>
              ))
          ) : (
            <Text style={{ fontSize: 11, color: C.mutedText }}>
              Bookmark questions during practice and they will appear here.
            </Text>
          )}
        </View>
      </View>
    </Shell>
  );
}
