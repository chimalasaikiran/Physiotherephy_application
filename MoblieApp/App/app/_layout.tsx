import { LogBox } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

LogBox.ignoreLogs([
  "Firebase Phone Auth",
  "FirebaseError",
  "Firebase:",
]);

export default function RootLayout() {
  return (
    <ErrorBoundary level="screen">
      <SafeAreaProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
