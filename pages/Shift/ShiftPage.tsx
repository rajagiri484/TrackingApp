import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import useLanding from "../../customHooks/landingPage/useLanding";
import { ScreenWithToolbar } from "../../components/shared/ScreenWithToolbar";
import { DeliveryRow } from "../../components/Shift/DeliveryRow";
import { ShiftMapHeader } from "../../components/Shift/ShiftMapHeader";
import type { RootStackParamList } from "../../navigation/types";
import type { FleetDelivery } from "../../types/fleet";

type Props = NativeStackScreenProps<RootStackParamList, "Shift">;

export function ShiftPage({ navigation }: Props) {
  const { data, isLoading, error, onComplete, onFail } = useLanding();

  const keyExtractor = useCallback((item: FleetDelivery) => item.id, []);

  // TODO - syncing of data while made changes in offline mode, and syncing lat lng data every 30 seconds along with battery optimissation

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FleetDelivery>) => (
      <DeliveryRow
        delivery={item}
        onComplete={() => void onComplete(item)}
        onFail={() => void onFail(item)}
      />
    ),
    [onComplete, onFail],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <View style={styles.mapBleed}>
          <ShiftMapHeader />
        </View>
        <Text style={styles.driver}>Alex Chen</Text>
        {data ? (
          <Text style={styles.vehicle}>
            {data.vehicleLabel} · {data.date}
          </Text>
        ) : null}
        <View style={[styles.syncStrip, styles.syncOnline]}>
          <Text style={styles.syncLabel}>Shift data</Text>
        </View>
        {error ? <Text style={styles.err}>{error}</Text> : null}
      </View>
    ),
    [data, error],
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScreenWithToolbar
      title="Today’s shift"
      right={
        <Pressable
          onPress={() => navigation.navigate("Profile")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Text style={styles.link}>Profile</Text>
        </Pressable>
      }
    >
      <View style={styles.inner}>
        <FlatList
          style={styles.list}
          data={data?.deliveries ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <Text style={styles.empty}>No deliveries on this shift.</Text>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenWithToolbar>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  inner: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  headerBlock: {
    paddingBottom: 8,
  },
  mapBleed: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  driver: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  vehicle: { fontSize: 14, color: "#64748b", marginBottom: 4 },
  link: { color: "#2563eb", fontWeight: "600", fontSize: 15 },
  err: { color: "#b91c1c", marginBottom: 8, fontSize: 14 },
  syncStrip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  syncOnline: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  syncLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  empty: { textAlign: "center", color: "#64748b", marginTop: 24 },
  list: { flex: 1 },
  listContent: { paddingBottom: 32 },
});
