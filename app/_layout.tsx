import "react-native-gesture-handler";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { theme } from "../src/ui/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: "700" }
        }}
      >
        <Stack.Screen name="index" options={{ title: "Daily System" }} />
        <Stack.Screen name="quest/[id]" options={{ title: "Quest HUD" }} />
        <Stack.Screen name="journal" options={{ title: "Reflection" }} />
        <Stack.Screen name="progress" options={{ title: "Progress" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
