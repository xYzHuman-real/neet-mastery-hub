import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StoreProvider } from "../native/store";

export const unstable_settings = {
  initialRouteName: "splash",
};

export default function Layout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack initialRouteName="splash" screenOptions={{ headerShown: false }} />
    </StoreProvider>
  );
}
