import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { LoginPage } from "../pages/Login/LoginPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { ShiftPage } from "../pages/Shift/ShiftPage";
import { getAuthLoggedIn } from "../storage/authSessionStorage";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [bootReady, setBootReady] = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>("Login");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loggedIn = await getAuthLoggedIn();
        if (!cancelled) {
          setInitialRoute(loggedIn ? "Shift" : "Login");
        }
      } finally {
        if (!cancelled) setBootReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!bootReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Shift" component={ShiftPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
