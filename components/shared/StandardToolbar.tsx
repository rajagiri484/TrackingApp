import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type StandardToolbarProps = {
  title: string;
  /** When true, shows a back control (typically bound to `navigation.goBack()`). */
  showBack?: boolean;
  onBackPress?: () => void;
  /** Optional actions (menu, save, etc.) — keep presentational; wire callbacks in the page/hook. */
  right?: ReactNode;
};

/**
 * Shared app chrome: same height, typography, and slots on every screen.
 * Pages compose this via ScreenWithToolbar so spacing and safe-area stay consistent.
 */
export function StandardToolbar({
  title,
  showBack = false,
  onBackPress,
  right,
}: StandardToolbarProps) {
  return (
    <View style={styles.bar} accessibilityRole="toolbar">
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={onBackPress}
            hitSlop={12}
            style={styles.backHit}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {right ?? <View style={styles.sideSpacer} />}
      </View>
    </View>
  );
}

const SIDE_WIDTH = 80;

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  sideSpacer: {
    minHeight: 44,
  },
  backHit: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  backText: {
    fontSize: 17,
    color: "#2563eb",
    fontWeight: "400",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
  },
});
