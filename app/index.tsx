import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { SUBJECTS, CHAPTERS, QUESTIONS } from "../native/content";
import { useStore } from "../native/store";

export default function Home() {
  const { hydrated, onboarded, user, telegramDone, streak, todayCount, goal, answered, due } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => { SplashScreen.hideAsync().catch(() => {}); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (onboarded && user && telegramDone) {
      setReady(true);
      return;
    }
    const t = setTimeout(() => {
      if (!onboarded) router.replace("/onboarding");
      else if (!user) router.replace("/login");
      else if (!telegramDone) router.replace("/telegram");
    }, 500);
    return () => clearTimeout(t);
  }, [hydrated, onboarded, user, telegramDone]);

  if (!hydrated || !ready) return <SplashGate />;

  const mastery = (sub: string) => {
    const q = QUESTIONS.filter((x) => CHAPTERS.find((c) => c.id === x.chapterId)?.subject === sub);
    return q.length ? Math.round(q.filter((x) => answered[x.id]).length / q.length * 100) : 0;
  };

  return (
    <Shell title="Namaste" subtitle="NEET 2027">
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, backgroundColor: C.primary, borderRadius: 24, padding: 16 }}>
          <Text style={{ fontSize: 20 }}>🔥</Text>
          <Text style={{ fontSize: 31, fontWeight: "900", color: C.primaryText, marginTop: 8 }}>{streak}</Text>
          <Text style={{ fontSize: 11, color: C.primaryText }}>day streak</Text>
        </View>
        <View style={{ flex: 1, borderRadius: 24, padding: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontSize: 20, color: C.primary }}>◎</Text>
          <Text style={{ fontSize: 27, fontWeight: "900", color: C.foreground, marginTop: 8 }}>{Math.min(todayCount, goal)}<Text style={{ fontSize: 14, color: C.mutedText }}>/{goal}</Text></Text>
          <Text style={{ fontSize: 11, color: C.mutedText }}>questions today</Text>
        </View>
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 17, fontWeight: "800", color: C.foreground }}>Syllabus Mastery</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 16 }}>
          {SUBJECTS.map((s) => (
            <View key={s.id} style={{ alignItems: "center" }}>
              <View style={{ height: 72, width: 72, borderRadius: 36, borderWidth: 7, borderColor: C.primary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "800", color: C.foreground }}>{mastery(s.id)}%</Text>
              </View>
              <Text style={{ fontSize: 11, color: C.mutedText, marginTop: 5 }}>{s.name}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ marginTop: 16, backgroundColor: "#F6EFCF", borderRadius: 24, padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: C.foreground }}>Due for Revision</Text>
          <Text style={{ fontWeight: "800", color: C.highlightText }}>{due.length}</Text>
        </View>
        {due.slice(0, 3).map((id) => <View key={id} style={{ backgroundColor: C.card, borderRadius: 15, padding: 12, marginTop: 9 }}><Text style={{ fontSize: 12, color: C.foreground }}>{QUESTIONS.find((q) => q.id === id)?.prompt}</Text></View>)}
        {!due.length && <Text style={{ fontSize: 13, color: C.mutedText, marginTop: 12 }}>All caught up 🎉</Text>}
        {due.length > 0 && <Pressable onPress={() => router.push({ pathname: "/practice", params: { review: "1" } })} style={{ marginTop: 10, minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, backgroundColor: C.primary }}><Text style={{ fontSize: 15, fontWeight: "800", color: C.primaryText }}>Start revision</Text></Pressable>}
      </View>

      <Text style={{ fontSize: 17, fontWeight: "800", color: C.foreground, marginTop: 18, marginBottom: 8 }}>Subjects</Text>
      {SUBJECTS.map((s) => <Pressable key={s.id} onPress={() => router.push({ pathname: "/chapters", params: { subject: s.id } })} style={{ flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, marginBottom: 8 }}><Text style={{ fontSize: 24, width: 48 }}>{s.emoji}</Text><View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.foreground }}>{s.name}</Text><Text style={{ fontSize: 11, color: C.mutedText }}>{CHAPTERS.filter((c) => c.subject === s.id).length} chapters · full question bank</Text></View><Text style={{ fontSize: 20, color: C.mutedText }}>›</Text></Pressable>)}
    </Shell>
  );
}

function SplashGate() {
  return <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}><View style={{ height: 92, width: 92, borderRadius: 30, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 46, fontWeight: "900", color: C.primaryText }}>B</Text></View><Text style={{ fontSize: 32, fontWeight: "900", color: C.foreground, marginTop: 18 }}>BuzNeet</Text><Text style={{ fontSize: 13, color: C.mutedText, marginTop: 5 }}>NCERT Progress Hub</Text></View>;
}
