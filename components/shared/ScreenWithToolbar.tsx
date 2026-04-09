import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/types";
import { StandardToolbar } from "./StandardToolbar";

export type ScreenWithToolbarProps = {
  title: string;
  children: ReactNode;
  right?: ReactNode;
};

/**
 * Standard screen layout: safe areas + shared toolbar + scrollable-friendly body.
 * Keeps each page focused on content; back visibility follows the navigation stack.
 */
export function ScreenWithToolbar({
  title,
  children,
  right,
}: ScreenWithToolbarProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <StandardToolbar
        title={title}
        showBack={showBack}
        onBackPress={() => navigation.goBack()}
        right={right}
      />
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  body: {
    flex: 1,
  },
});
