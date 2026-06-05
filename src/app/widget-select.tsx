import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useCountdowns } from "@/hooks/useCountdowns";
import { syncWidget } from "@/hooks/useWidget";
import type { Countdown } from "@/types";

export default function WidgetSelectScreen() {
  const router = useRouter();
  const { countdowns, activeWidgetCountdownId, setWidgetCountdown } =
    useCountdowns();

  const handleSelect = useCallback(
    async (countdown: Countdown) => {
      await setWidgetCountdown(countdown.id);
      syncWidget(countdown);
      router.back();
    },
    [setWidgetCountdown, router]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Widget Countdown</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Close"
        >
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      </View>

      {countdowns.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No countdowns yet. Add one from the Home tab.
          </Text>
        </View>
      ) : (
        <FlatList
          data={countdowns}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isActive = activeWidgetCountdownId === item.id;
            return (
              <TouchableOpacity
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => handleSelect(item)}
                testID={`select-widget-${item.id}`}
                accessibilityLabel={`Select ${item.name} as widget`}
              >
                <Text style={styles.rowEmoji}>{item.emoji}</Text>
                <Text style={[styles.rowName, isActive && styles.rowNameActive]}>
                  {item.name}
                </Text>
                {isActive && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  closeText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#208AEF",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: "#EBF4FF",
  },
  rowEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  rowName: {
    flex: 1,
    fontSize: 17,
    color: "#1C1C1E",
  },
  rowNameActive: {
    color: "#208AEF",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 18,
    color: "#208AEF",
    fontWeight: "700",
  },
});
