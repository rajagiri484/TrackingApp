import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FleetDelivery } from "../../types/fleet";

export type DeliveryRowProps = {
  delivery: FleetDelivery;
  onComplete: () => void;
  onFail: () => void;
};

function formatProducts(d: FleetDelivery) {
  return d.products.map((p) => `${p.gallons} gal ${p.product}`).join(" · ");
}

export function DeliveryRow({
  delivery,
  onComplete,
  onFail,
}: DeliveryRowProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.dest}>{delivery.destinationName}</Text>
      <Text style={styles.meta}>
        {delivery.destinationType} · {delivery.scheduledWindow}
      </Text>
      <Text style={styles.products}>{formatProducts(delivery)}</Text>
      {delivery.status !== "PENDING" ? (
        <Text style={styles.status}>Status: {delivery.status}</Text>
      ) : (
        <View style={styles.button}>
          <Pressable style={styles.buttonBG} onPress={onComplete}>
            <Text style={styles.buttonText}>Complete</Text>
          </Pressable>
          <Pressable style={styles.buttonBG} onPress={onFail}>
            <Text style={styles.buttonText}>Fail</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBG: {
    width: 100,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "green",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    flexDirection: "row",
    gap: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
    gap: 6,
  },
  dest: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  meta: {
    fontSize: 13,
    color: "#64748b",
  },
  products: {
    fontSize: 14,
    color: "#334155",
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
});
