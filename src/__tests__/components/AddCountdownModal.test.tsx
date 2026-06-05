import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AddCountdownModal from "@/components/AddCountdownModal";
import { Alert } from "react-native";
// Mock DateTimePicker so it renders in Jest
jest.mock("@react-native-community/datetimepicker", () => {
  const { View } = require("react-native");
  const MockPicker = (props: { testID?: string }) => (
    <View testID={props.testID ?? "date-picker"} />
  );
  MockPicker.displayName = "DateTimePicker";
  return MockPicker;
});

const mockOnClose = jest.fn();
const mockOnAdd = jest.fn();

async function renderModal(visible = true) {
  return render(
    <AddCountdownModal
      visible={visible}
      onClose={mockOnClose}
      onAdd={mockOnAdd}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

describe("AddCountdownModal", () => {
  it("renders when visible", async () => {
    const { getByTestId } = await renderModal();
    expect(getByTestId("add-countdown-modal")).toBeTruthy();
  });

  it("shows name and emoji inputs", async () => {
    const { getByTestId } = await renderModal();
    expect(getByTestId("name-input")).toBeTruthy();
    expect(getByTestId("emoji-input")).toBeTruthy();
  });

  it("shows Cancel and Add buttons", async () => {
    const { getByTestId } = await renderModal();
    expect(getByTestId("modal-cancel-button")).toBeTruthy();
    expect(getByTestId("modal-add-button")).toBeTruthy();
  });

  it("calls onClose when Cancel is pressed", async () => {
    const { getByTestId } = await renderModal();
    fireEvent.press(getByTestId("modal-cancel-button"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onAdd when name is empty", async () => {
    const { getByTestId } = await renderModal();
    fireEvent.changeText(getByTestId("emoji-input"), "🎉");
    fireEvent.press(getByTestId("modal-add-button"));
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when emoji is empty", async () => {
    const { getByTestId } = await renderModal();
    fireEvent.changeText(getByTestId("name-input"), "Birthday");
    fireEvent.press(getByTestId("modal-add-button"));
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it("calls onAdd with correct shape when form is valid", async () => {
    const { getByTestId } = await renderModal();
    fireEvent.changeText(getByTestId("name-input"), "Birthday");
    fireEvent.changeText(getByTestId("emoji-input"), "🎂");
    fireEvent.press(getByTestId("modal-add-button"));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    const arg = mockOnAdd.mock.calls[0][0];
    expect(arg.name).toBe("Birthday");
    expect(arg.emoji).toBe("🎂");
    expect(typeof arg.targetDate).toBe("number");
    expect(arg.targetDate).toBeGreaterThan(Date.now());
  });

  it("calls onClose after successful submission", async () => {
    const { getByTestId } = await renderModal();
    fireEvent.changeText(getByTestId("name-input"), "Test");
    fireEvent.changeText(getByTestId("emoji-input"), "🧪");
    fireEvent.press(getByTestId("modal-add-button"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
