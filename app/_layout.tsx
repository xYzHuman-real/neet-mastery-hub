import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { StoreProvider } from "../native/store";
import { StyleSheet, Text, View } from "react-native";

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

export const unstable_settings = {
  initialRouteName: "splash",
  screenErrorBoundary: ScreenErrorBoundary,
};

export default function Layout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        initialRouteName="splash"
        unstable_screenErrorBoundary={ScreenErrorBoundary}
        screenOptions={{ headerShown: false }}
      />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  error: {
    flex: 1,
    backgroundColor: "#FAF9F1",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: { fontSize: 30, fontWeight: "900", color: "#263C3A" },
  text: { marginTop: 12, fontSize: 15, color: "#6E7775", textAlign: "center" },
  detail: { marginTop: 18, fontSize: 13, color: "#263C3A", textAlign: "center" },
  retry: {
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#26786F",
    color: "#F9F8F0",
    overflow: "hidden",
    fontWeight: "800",
  },
});
