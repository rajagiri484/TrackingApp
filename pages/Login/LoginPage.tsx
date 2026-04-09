import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/types";
import { setAuthLoggedIn } from "../../storage/authSessionStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginPage({ navigation }: Props) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo");
  const [busy, setBusy] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Fleet Driver</Text>
          <Text style={styles.hint}>
            Static UI — sign in only switches screens (no server or storage).
          </Text>
          <TextInput
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Pressable
            style={[styles.btn, busy && styles.btnDisabled]}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await setAuthLoggedIn(true);
                navigation.reset({ index: 0, routes: [{ name: "Shift" }] });
              } finally {
                setBusy(false);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.btnText}>{busy ? "Signing in…" : "Sign in"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  flex: { flex: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  hint: { fontSize: 14, color: "#64748b", lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
