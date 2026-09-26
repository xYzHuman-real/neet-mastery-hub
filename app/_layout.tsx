import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { StoreProvider } from "../native/store";
import { StyleSheet, Text, View } from "react-native";
import { C } from "../native/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function ScreenErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.error}>
      <Text style={styles.title}>BuzNeet</Text>
      <Text style={styles.text}>The app hit a startup error.</Text>
      <Text selectable style={styles.detail}>{error.message}</Text>
      <Text style={styles.retry} onPress={retry}>Try again</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        unstable_screenErrorBoundary={ScreenErrorBoundary}
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 220,
          animationTypeForReplace: "push",
          contentStyle: { backgroundColor: C.background },
        }}
      />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 28 },
  title: { fontSize: 30, fontWeight: "900", color: C.foreground },
  text: { marginTop: 12, fontSize: 15, color: C.mutedText, textAlign: "center" },
  detail: { marginTop: 18, fontSize: 13, color: C.foreground, textAlign: "center" },
  retry: { marginTop: 24, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, backgroundColor: C.primary, color: C.primaryText, overflow: "hidden", fontWeight: "800" },
});
