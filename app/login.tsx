import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";
import {
  createEmailAccount,
  resetPassword,
  signInWithEmail,
  signInWithGoogleCredential,
} from "../native/firebaseAuth";

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID =
  "662275162506-8du5una6uau1pgk7jglktovbnd60h89b.apps.googleusercontent.com";
const WEB_CLIENT_ID =
  "662275162506-85ojnhl3eafr4j53jog8c0ukmte3crj1.apps.googleusercontent.com";

type Mode = "signIn" | "signUp";

function authMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Choose a stronger password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return error instanceof Error && error.message
        ? error.message
        : "Sign-in failed. Please try again.";
  }
}

export default function Login() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { patch } = useStore();

  const redirectUri = makeRedirectUri({
    scheme: "buzneet",
    path: "oauth",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const accessToken = response.authentication?.accessToken;
    if (!accessToken) {
      setError("Google sign-in completed without an access token.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setBusy(true);
        setError("");
        const account = await signInWithGoogleCredential("", accessToken);

        if (cancelled) return;

        patch({
          user: {
            name: account.displayName || "NEET Aspirant",
            email: account.email || "",
          },
          onboarded: true,
          telegramDone: false,
        });

        router.replace("/telegram");
      } catch (e) {
        if (!cancelled) setError(authMessage(e));
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [response, patch]);

  const submitGoogle = async () => {
    if (busy || !request) return;

    setError("");
    setNotice("");
    setBusy(true);

    try {
      await promptAsync({ showInRecents: true });
    } catch (e) {
      setBusy(false);
      setError(authMessage(e));
    }
  };

  const finish = () => {
    router.replace("/telegram");
  };

  const submitEmail = async () => {
    setError("");
    setNotice("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (mode === "signUp" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signUp" && !name.trim()) {
      setError("Enter your name.");
      return;
    }

    setBusy(true);
    try {
      const account =
        mode === "signUp"
          ? await createEmailAccount(name, email, password)
          : await signInWithEmail(email, password);

      patch({
        user: {
          name: account.displayName || name.trim() || "NEET Aspirant",
          email: account.email || email.trim(),
        },
        onboarded: true,
        telegramDone: false,
      });
      finish();
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setError("");
    setNotice("");
    setBusy(true);

    try {
      await resetPassword(email);
      setNotice(
        "If that email has an account, Firebase has sent the password reset email.",
      );
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Phone>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>B</Text>
          </View>

          <Text style={styles.title}>Welcome to BuzNeet</Text>
          <Text style={styles.subtitle}>
            Sign in to save your preparation progress and continue anywhere.
          </Text>

          <Pressable
            disabled={busy || !request}
            onPress={submitGoogle}
            style={[styles.google, (busy || !request) && { opacity: 0.6 }]}
          >
            {busy ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.googleG}>G</Text>
            )}
            <Text style={styles.googleText}>
              {busy ? "Signing in…" : "Continue with Google"}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>or</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.switcher}>
            <Pressable
              onPress={() => {
                setMode("signIn");
                setError("");
                setNotice("");
              }}
              style={[
                styles.switchItem,
                mode === "signIn" && styles.switchActive,
              ]}
            >
              <Text
                style={[
                  styles.switchText,
                  mode === "signIn" && styles.switchTextActive,
                ]}
              >
                Sign in
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode("signUp");
                setError("");
                setNotice("");
              }}
              style={[
                styles.switchItem,
                mode === "signUp" && styles.switchActive,
              ]}
            >
              <Text
                style={[
                  styles.switchText,
                  mode === "signUp" && styles.switchTextActive,
                ]}
              >
                Create account
              </Text>
            </Pressable>
          </View>

          {mode === "signUp" && (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={C.mutedText}
              autoCapitalize="words"
              style={styles.input}
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={C.mutedText}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={C.mutedText}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable
            disabled={busy}
            onPress={submitEmail}
            style={[styles.primary, busy && { opacity: 0.6 }]}
          >
            {busy && <ActivityIndicator color={C.primaryText} size="small" />}
            <Text style={styles.primaryText}>
              {mode === "signIn" ? "Continue with Email" : "Create account"}
            </Text>
          </Pressable>

          {mode === "signIn" && (
            <Pressable
              onPress={forgotPassword}
              disabled={busy}
              style={{ padding: 12, alignItems: "center" }}
            >
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!notice && <Text style={styles.notice}>{notice}</Text>}

          <Text style={styles.footer}>
            Accounts are securely managed by Firebase Authentication.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Phone>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: C.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 28, fontWeight: "900", color: C.highlightText },
  title: {
    fontSize: 31,
    fontWeight: "900",
    color: C.foreground,
    marginTop: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: C.mutedText,
    marginTop: 5,
  },
  google: {
    minHeight: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 24,
  },
  googleG: { fontSize: 19, fontWeight: "900", color: "#4285F4" },
  googleText: { fontSize: 14, fontWeight: "800", color: C.foreground },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  line: { height: 1, flex: 1, backgroundColor: C.border },
  or: { fontSize: 12, color: C.mutedText, fontWeight: "700" },
  switcher: {
    flexDirection: "row",
    backgroundColor: C.muted,
    borderRadius: 14,
    padding: 4,
  },
  switchItem: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  switchActive: { backgroundColor: C.card },
  switchText: { fontSize: 12, fontWeight: "700", color: C.mutedText },
  switchTextActive: { color: C.foreground },
  input: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    color: C.foreground,
    paddingHorizontal: 15,
    marginTop: 10,
    fontSize: 14,
  },
  primary: {
    minHeight: 54,
    borderRadius: 17,
    marginTop: 12,
    backgroundColor: C.primary,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: C.primaryText, fontSize: 14, fontWeight: "900" },
  link: { color: C.primary, fontSize: 12, fontWeight: "800" },
  error: {
    color: C.destructive,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
  },
  notice: {
    color: C.success,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
  },
  footer: {
    color: C.mutedText,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 16,
  },
});
