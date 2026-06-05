import CountdownCard from "@/components/CountdownCard";
import type { Countdown } from "@/types";
import { act, fireEvent, render } from "@testing-library/react-native";

const futureDate = Date.now() + 5 * 24 * 60 * 60 * 1000; // 5 days from now

const mockCountdown: Countdown = {
  id: 1,
  name: "Summer Vacation",
  emoji: "🏖️",
  targetDate: futureDate,
  createdAt: Date.now(),
};

const mockDelete = jest.fn();
const mockSetWidget = jest.fn();
const mockEdit = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CountdownCard", () => {
  it("renders the countdown name and emoji", async () => {
    const { getByText } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    expect(getByText("Summer Vacation")).toBeTruthy();
    expect(getByText("🏖️")).toBeTruthy();
  });

  it("renders days/hrs/min/sec labels for a future countdown", async () => {
    const { getByText } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    expect(getByText("days")).toBeTruthy();
    expect(getByText("hrs")).toBeTruthy();
    expect(getByText("min")).toBeTruthy();
    expect(getByText("sec")).toBeTruthy();
  });

  it("shows 'Set as Widget' button when not active", async () => {
    const { getByText } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    expect(getByText("Set as Widget")).toBeTruthy();
  });

  it("shows 'Showing on Widget' when isActiveWidget is true", async () => {
    const { getByText } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={true}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    expect(getByText("Showing on Widget")).toBeTruthy();
    expect(getByText("Widget")).toBeTruthy();
  });

  it("calls onSetWidget with the countdown id when the widget button is pressed", async () => {
    const { getByTestId } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    fireEvent.press(getByTestId("set-widget-button-1"));
    expect(mockSetWidget).toHaveBeenCalledWith(mockCountdown.id);
  });

  it("renders a delete button for the countdown", async () => {
    const { getByTestId } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    expect(getByTestId("delete-button-1")).toBeTruthy();
  });

  it("shows Completed for an expired countdown", async () => {
    const expired: Countdown = {
      ...mockCountdown,
      targetDate: Date.now() - 1000,
    };
    const { getByText } = await render(
      <CountdownCard
        countdown={expired}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    expect(getByText("🎉 Completed!")).toBeTruthy();
  });

  it("updates the timer display every second without crashing", async () => {
    jest.useFakeTimers();
    const { getByText } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText("days")).toBeTruthy();
    jest.useRealTimers();
  });

  it("calls onEdit when the countdown card is pressed", async () => {
    const { getByTestId } = await render(
      <CountdownCard
        countdown={mockCountdown}
        isActiveWidget={false}
        onDelete={mockDelete}
        onSetWidget={mockSetWidget}
        onEdit={mockEdit}
      />,
    );
    fireEvent.press(getByTestId("countdown-card-1"));
    expect(mockEdit).toHaveBeenCalledWith(mockCountdown);
  });
});
