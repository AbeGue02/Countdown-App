import { useCountdowns } from "@/hooks/useCountdowns";
import { clearWidget } from "@/hooks/useWidget";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const { removeAll, countdowns } = useCountdowns();

  const handleDeleteAll = () => {
    if (countdowns.length === 0) {
      Alert.alert("No Countdowns", "There are no countdowns to delete.");
      return;
    }
    Alert.alert(
      "Delete All Countdowns",
      "This will permanently delete all your countdowns. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await removeAll();
            clearWidget();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity
          style={styles.dangerRow}
          onPress={handleDeleteAll}
          testID="delete-all-button"
          accessibilityLabel="Delete all countdowns"
        >
          <Text style={styles.dangerText}>Delete All Countdowns</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Countdown App — all data stored locally on your device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 20,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C6C70",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  dangerRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C6C6C8",
  },
  dangerText: {
    fontSize: 17,
    color: "#FF3B30",
  },
  footer: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 32,
  },
});
