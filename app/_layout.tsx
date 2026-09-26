import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StoreProvider } from "../native/store";
import { C } from "../native/theme";

export default function Layout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "none", contentStyle: { backgroundColor: C.background } }} />
    </StoreProvider>
  );
}
