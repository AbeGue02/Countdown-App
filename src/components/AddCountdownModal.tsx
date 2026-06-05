import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: { name: string; emoji: string; targetDate: number }) => void;
}

export default function AddCountdownModal({ visible, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const reset = useCallback(() => {
    setName("");
    setEmoji("");
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setTargetDate(d);
    setShowDatePicker(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedName) {
      Alert.alert("Missing Name", "Please enter a name for your countdown.");
      return;
    }
    if (!trimmedEmoji) {
      Alert.alert("Missing Emoji", "Please enter an emoji for your countdown.");
      return;
    }
    if (targetDate.getTime() <= Date.now()) {
      Alert.alert("Invalid Date", "Please choose a target date in the future.");
      return;
    }

    onAdd({
      name: trimmedName,
      emoji: trimmedEmoji,
      targetDate: targetDate.getTime(),
    });
    reset();
    onClose();
  }, [name, emoji, targetDate, onAdd, reset, onClose]);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
      if (selected) {
        setTargetDate(selected);
      }
    },
    [],
  );

  const formattedDate = targetDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      testID="add-countdown-modal"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            testID="modal-cancel-button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Countdown</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            testID="modal-add-button"
            accessibilityLabel="Add countdown"
          >
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Summer Vacation"
            value={name}
            onChangeText={setName}
            maxLength={50}
            testID="name-input"
            accessibilityLabel="Countdown name"
          />

          <Text style={styles.label}>Emoji</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 🏖️"
            value={emoji}
            onChangeText={(text) => {
              // Accept only the first grapheme cluster (emoji)
              setEmoji(text.slice(0, 2));
            }}
            maxLength={2}
            testID="emoji-input"
            accessibilityLabel="Countdown emoji"
          />

          <Text style={styles.label}>Target Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            testID="date-picker-button"
            accessibilityLabel={`Target date: ${formattedDate}`}
          >
            <Text style={styles.dateButtonText}>{formattedDate}</Text>
          </TouchableOpacity>

          {(showDatePicker || Platform.OS === "ios") && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={new Date(Date.now() + 60 * 1000)}
              onChange={handleDateChange}
              testID="date-picker"
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  cancelText: {
    fontSize: 17,
    color: "#FF3B30",
  },
  addText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#208AEF",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C6C70",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C6C6C8",
  },
  dateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#C6C6C8",
  },
  dateButtonText: {
    fontSize: 17,
    color: "#208AEF",
  },
});
