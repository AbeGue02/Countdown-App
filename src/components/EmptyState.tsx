import { StyleSheet, Text, View } from "react-native";

export default function EmptyState() {
  return (
    <View style={styles.container} testID="empty-state">
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>No Countdowns Yet</Text>
      <Text style={styles.subtitle}>
        Tap the <Text style={styles.highlight}>+</Text> button to add your first
        countdown.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  highlight: {
    fontSize: 18,
    fontWeight: "700",
    color: "#208AEF",
  },
});
