import type { Countdown } from "@/types";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  countdown: Countdown;
  isActiveWidget: boolean;
  onDelete: (id: number) => void;
  onSetWidget: (id: number) => void;
  onEdit: (countdown: Countdown) => void;
}

function getTimeComponents(targetDate: number) {
  const diff = targetDate - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isExpired: false };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownCard({
  countdown,
  isActiveWidget,
  onDelete,
  onSetWidget,
  onEdit,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeComponents(countdown.targetDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeComponents(countdown.targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown.targetDate]);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Countdown", `Delete "${countdown.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(countdown.id),
      },
    ]);
  }, [countdown.id, countdown.name, onDelete]);

  return (
    <TouchableOpacity
      style={[styles.card, isActiveWidget && styles.activeWidgetCard]}
      testID={`countdown-card-${countdown.id}`}
      onPress={() => onEdit(countdown)}
      activeOpacity={0.95}
      accessibilityLabel={`Edit ${countdown.name}`}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{countdown.emoji}</Text>
        <View style={styles.headerRight}>
          {isActiveWidget && (
            <View style={styles.widgetBadge}>
              <Text style={styles.widgetBadgeText}>Widget</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            testID={`delete-button-${countdown.id}`}
            accessibilityLabel={`Delete ${countdown.name}`}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {countdown.name}
      </Text>

      {timeLeft.isExpired ? (
        <Text style={styles.expiredText}>🎉 Completed!</Text>
      ) : (
        <View style={styles.timerRow}>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{timeLeft.days}</Text>
            <Text style={styles.timeLabel}>days</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{pad(timeLeft.hours)}</Text>
            <Text style={styles.timeLabel}>hrs</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{pad(timeLeft.minutes)}</Text>
            <Text style={styles.timeLabel}>min</Text>
          </View>
          <Text style={styles.separator}>:</Text>
          <View style={styles.timeUnit}>
            <Text style={styles.timeValue}>{pad(timeLeft.seconds)}</Text>
            <Text style={styles.timeLabel}>sec</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => onSetWidget(countdown.id)}
        style={[
          styles.widgetButton,
          isActiveWidget && styles.widgetButtonActive,
        ]}
        testID={`set-widget-button-${countdown.id}`}
        accessibilityLabel={
          isActiveWidget ? "Active widget countdown" : "Set as widget countdown"
        }
      >
        <Text
          style={[
            styles.widgetButtonText,
            isActiveWidget && styles.widgetButtonTextActive,
          ]}
        >
          {isActiveWidget ? "Showing on Widget" : "Set as Widget"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  activeWidgetCard: {
    borderWidth: 2,
    borderColor: "#208AEF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 36,
  },
  widgetBadge: {
    backgroundColor: "#208AEF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  widgetBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  timeUnit: {
    alignItems: "center",
    minWidth: 48,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#208AEF",
    fontVariant: ["tabular-nums"],
  },
  timeLabel: {
    fontSize: 11,
    color: "#8E8E93",
    textTransform: "uppercase",
    marginTop: 2,
  },
  separator: {
    fontSize: 24,
    fontWeight: "700",
    color: "#C7C7CC",
    marginBottom: 12,
    marginHorizontal: 4,
  },
  expiredText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  widgetButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#208AEF",
    paddingVertical: 8,
    alignItems: "center",
  },
  widgetButtonActive: {
    backgroundColor: "#208AEF",
  },
  widgetButtonText: {
    color: "#208AEF",
    fontSize: 14,
    fontWeight: "600",
  },
  widgetButtonTextActive: {
    color: "#FFFFFF",
  },
});
