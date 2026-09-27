import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

async function getGoogleUser(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Unable to read Google account");
  return res.json() as Promise<{ name?: string; email?: string; picture?: string }>;
}

export default function Login() {
  const { patch } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const redirectUri = makeRedirectUri({ scheme: "buzneet", path: "oauth" });
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID || undefined,
    webClientId: WEB_CLIENT_ID || undefined,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type !== "success" || !response.authentication?.accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        setBusy(true);
        setError("");
        const profile = await getGoogleUser(response.authentication!.accessToken);
        if (cancelled) return;
        patch({
          user: { name: profile.name || "NEET Aspirant", email: profile.email || "" },
          onboarded: true,
          telegramDone: false,
        });
        router.replace("/telegram");
      } catch (e) {
        if (!cancelled) setError("Google sign-in completed, but BuzNeet couldn't load the account. Please try again.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => { cancelled = true; };
  }, [response]);

  const signIn = async () => {
    if (!ANDROID_CLIENT_ID && !WEB_CLIENT_ID) {
      setError("Google sign-in is not configured yet. Add the BuzNeet Google OAuth client ID to the build.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await promptAsync({ showInRecents: true });
    } catch {
      setBusy(false);
      setError("Could not open Google sign-in. Please try again.");
    }
  };

  return (
    <Phone>
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <View style={{ height: 56, width: 56, borderRadius: 18, backgroundColor: C.highlight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: C.highlightText }}>B</Text>
        </View>
        <Text style={{ fontSize: 31, fontWeight: "900", color: C.foreground, marginTop: 22 }}>Welcome to BuzNeet</Text>
        <Text style={{ fontSize: 14, color: C.mutedText, marginTop: 4 }}>Sign in to keep your preparation progress synced on this device.</Text>

        <Pressable disabled={!request || busy} onPress={signIn} style={[a.google, (!request || busy) && { opacity: 0.55 }]}>
          {busy ? <ActivityIndicator size="small" /> : <Text style={{ fontSize: 18, fontWeight: "900", color: "#4285F4" }}>G</Text>}
          <Text style={{ fontSize: 14, fontWeight: "800", color: C.foreground }}>
            {busy ? "Opening Google…" : "Continue with Google"}
          </Text>
        </Pressable>

        {!!error && <Text style={{ fontSize: 12, lineHeight: 18, color: C.destructive, textAlign: "center", marginTop: 14 }}>{error}</Text>}
        <Text style={{ fontSize: 11, lineHeight: 17, color: C.mutedText, textAlign: "center", marginTop: 12 }}>
          You’ll choose your Google account in the secure Google sign-in flow.
        </Text>
      </View>
    </Phone>
  );
}

const a = StyleSheet.create({
  google: {
    minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 10, paddingHorizontal: 18, backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, marginTop: 28,
  },
});
