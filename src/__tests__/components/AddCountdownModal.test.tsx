import AddCountdownModal from "@/components/AddCountdownModal";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";
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
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(async () => {
  await cleanup();
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
    const { findByTestId } = await renderModal();
    const cancelButton = await findByTestId("modal-cancel-button");
    await act(async () => {
      fireEvent.press(cancelButton);
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onAdd when name is empty", async () => {
    const { findByTestId } = await renderModal();
    const emojiInput = await findByTestId("emoji-input");
    const addButton = await findByTestId("modal-add-button");
    await act(async () => {
      fireEvent.changeText(emojiInput, "🎉");
      fireEvent.press(addButton);
    });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when emoji is empty", async () => {
    const { findByTestId } = await renderModal();
    const nameInput = await findByTestId("name-input");
    const addButton = await findByTestId("modal-add-button");
    await act(async () => {
      fireEvent.changeText(nameInput, "Birthday");
      fireEvent.press(addButton);
    });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it.skip("calls onAdd with correct shape when form is valid", async () => {
    const { findByTestId } = await renderModal();
    const nameInput = await findByTestId("name-input");
    const emojiInput = await findByTestId("emoji-input");
    const addButton = await findByTestId("modal-add-button");
    await act(async () => {
      fireEvent.changeText(nameInput, "Birthday");
      fireEvent.changeText(emojiInput, "A");
      fireEvent.press(addButton);
    });
    await waitFor(() => expect(mockOnAdd).toHaveBeenCalledTimes(1));
    const arg = mockOnAdd.mock.calls[0][0];
    expect(arg.name).toBe("Birthday");
    expect(arg.emoji).toBe("A");
    expect(typeof arg.targetDate).toBe("number");
    expect(arg.targetDate).toBeGreaterThan(Date.now());
  });

  it.skip("calls onClose after successful submission", async () => {
    const { findByTestId } = await renderModal();
    const nameInput = await findByTestId("name-input");
    const emojiInput = await findByTestId("emoji-input");
    const addButton = await findByTestId("modal-add-button");
    await act(async () => {
      fireEvent.changeText(nameInput, "Test");
      fireEvent.changeText(emojiInput, "B");
      fireEvent.press(addButton);
    });
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
  });
});
