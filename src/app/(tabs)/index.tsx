import AddCountdownModal from "@/components/AddCountdownModal";
import CountdownCard from "@/components/CountdownCard";
import EmptyState from "@/components/EmptyState";
import { useCountdowns } from "@/hooks/useCountdowns";
import { useWidgetSync } from "@/hooks/useWidget";
import type { Countdown } from "@/types";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const {
    countdowns,
    activeWidgetCountdownId,
    isLoading,
    add,
    edit,
    remove,
    setWidgetCountdown,
  } = useCountdowns();

  useWidgetSync(countdowns, activeWidgetCountdownId);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(
    null,
  );

  const handleSubmitCountdown = useCallback(
    async (input: { name: string; emoji: string; targetDate: number }) => {
      if (editingCountdown) {
        await edit(editingCountdown.id, input);
      } else {
        await add(input);
      }
      setModalVisible(false);
      setEditingCountdown(null);
    },
    [add, edit, editingCountdown],
  );

  const handleOpenEdit = useCallback((countdown: Countdown) => {
    setEditingCountdown(countdown);
    setModalVisible(true);
  }, []);

  const handleSetWidget = useCallback(
    async (id: number) => {
      await setWidgetCountdown(id === activeWidgetCountdownId ? null : id);
    },
    [setWidgetCountdown, activeWidgetCountdownId],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {countdowns.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={countdowns}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CountdownCard
              countdown={item}
              isActiveWidget={activeWidgetCountdownId === item.id}
              onDelete={remove}
              onSetWidget={handleSetWidget}
              onEdit={handleOpenEdit}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingCountdown(null);
          setModalVisible(true);
        }}
        testID="add-countdown-fab"
        accessibilityLabel="Add new countdown"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddCountdownModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingCountdown(null);
        }}
        onAdd={handleSubmitCountdown}
        mode={editingCountdown ? "edit" : "add"}
        initialValues={
          editingCountdown
            ? {
                name: editingCountdown.name,
                emoji: editingCountdown.emoji,
                targetDate: editingCountdown.targetDate,
              }
            : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
  },
  list: {
    paddingVertical: 8,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#208AEF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 36,
  },
});
