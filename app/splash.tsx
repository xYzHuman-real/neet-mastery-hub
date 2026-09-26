import { useEffect } from "react";
import { Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";

export default function Splash() {
  const { hydrated, onboarded, user, telegramDone } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (!onboarded) router.replace("/onboarding");
      else if (!user) router.replace("/login");
      else if (!telegramDone) router.replace("/telegram");
      else router.replace("/");
    }, 900);
    return () => clearTimeout(t);
  }, [hydrated, onboarded, user, telegramDone]);

  return (
    <Phone>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={{ height: 92, width: 92, borderRadius: 30, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 46, fontWeight: "900", color: C.primaryText }}>B</Text>
        </View>
        <Text style={{ fontSize: 32, fontWeight: "900", color: C.foreground, marginTop: 18 }}>BuzNeet</Text>
        <Text style={{ fontSize: 13, color: C.mutedText, marginTop: 5 }}>NCERT Progress Hub</Text>
      </View>
    </Phone>
  );
}
