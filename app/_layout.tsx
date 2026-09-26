import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "../native/theme";

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "none", contentStyle: { backgroundColor: C.background } }} />
    </>
  );
}
