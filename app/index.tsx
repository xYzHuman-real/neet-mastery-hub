import { useEffect } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { C } from "../native/theme";
import { useStore } from "../native/store";

export default function Startup() {
  const { hydrated, onboarded, user, telegramDone } = useStore();

  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      if (!onboarded) router.replace("/onboarding");
      else if (!user) router.replace("/login");
      else if (!telegramDone) router.replace("/telegram");
      else router.replace("/home");
    }, 700);

    return () => clearTimeout(timer);
  }, [hydrated, onboarded, user, telegramDone]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.background,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          height: 92,
          width: 92,
          borderRadius: 30,
          backgroundColor: C.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 46, fontWeight: "900", color: C.primaryText }}>
          B
        </Text>
      </View>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "900",
          color: C.foreground,
          marginTop: 18,
        }}
      >
        BuzNeet
      </Text>
      <Text style={{ fontSize: 14, color: C.mutedText, marginTop: 8 }}>
        {hydrated ? "Preparing your workspace…" : "Loading your workspace…"}
      </Text>
    </View>
  );
}
