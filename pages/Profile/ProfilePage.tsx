import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenWithToolbar } from "../../components/shared/ScreenWithToolbar";
import type { RootStackParamList } from "../../navigation/types";
import { setAuthLoggedIn } from "../../storage/authSessionStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function ProfilePage({ navigation }: Props) {
  const [busy, setBusy] = useState(false);

  return (
    <ScreenWithToolbar title="Profile">
      <View style={styles.container}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.body}>
          Driver settings and compliance docs would live here.
        </Text>
        <Pressable
          style={[styles.out, busy && styles.outDisabled]}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await setAuthLoggedIn(false);
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } finally {
              setBusy(false);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.outText}>
            {busy ? "Signing out…" : "Sign out"}
          </Text>
        </Pressable>
      </View>
    </ScreenWithToolbar>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  body: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  out: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#fee2e2",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  outDisabled: { opacity: 0.7 },
  outText: {
    color: "#991b1b",
    fontWeight: "700",
    fontSize: 16,
  },
});
