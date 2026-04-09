import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DbSyncUiProvider } from "./contexts/DbSyncUiContext";
import { usePushNotifications } from "./customHooks/usePushNotifications";
import { AppNavigator } from "./navigation/AppNavigator";
import { FleetDatabase } from "./storage/fleetDatabase";

function PushBootstrap() {
  usePushNotifications();
  return null;
}

export default function App() {
  useEffect(() => {
    FleetDatabase.init();
  }, []);

  return (
    <SafeAreaProvider>
      <DbSyncUiProvider>
        <PushBootstrap />
        <AppNavigator />
        <StatusBar style="dark" />
      </DbSyncUiProvider>
    </SafeAreaProvider>
  );
}
