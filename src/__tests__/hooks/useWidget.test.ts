import { clearWidget, syncWidget } from "@/hooks/useWidget";
import type { Countdown } from "@/types";

// Mock the widget module
jest.mock("@/widgets/CountdownWidget", () => ({
  __esModule: true,
  default: {
    updateSnapshot: jest.fn(),
    updateTimeline: jest.fn(),
    reload: jest.fn(),
  },
}));

import CountdownWidget from "@/widgets/CountdownWidget";

beforeEach(() => {
  jest.clearAllMocks();
});

const futureDate = Date.now() + 10 * 24 * 60 * 60 * 1000; // 10 days from now

const mockCountdown: Countdown = {
  id: 1,
  name: "Vacation",
  emoji: "✈️",
  targetDate: futureDate,
  createdAt: Date.now(),
};

describe("syncWidget", () => {
  it("calls updateTimeline with entries matching the countdown", () => {
    syncWidget(mockCountdown);
    expect(CountdownWidget.updateTimeline).toHaveBeenCalledTimes(1);
    const entries: {
      date: Date;
      props: { name: string; emoji: string; daysRemaining: number };
    }[] = (CountdownWidget.updateTimeline as jest.Mock).mock.calls[0][0];
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].props.name).toBe("Vacation");
    expect(entries[0].props.emoji).toBe("✈️");
    expect(entries[0].props.daysRemaining).toBeGreaterThan(0);
  });

  it("calls updateSnapshot with daysRemaining 0 when targetDate is in the past", () => {
    const expired: Countdown = {
      ...mockCountdown,
      targetDate: Date.now() - 1000,
    };
    syncWidget(expired);
    expect(CountdownWidget.updateSnapshot).toHaveBeenCalledWith({
      name: "Vacation",
      emoji: "✈️",
      daysRemaining: 0,
    });
  });

  it("caps timeline entries at 365 days", () => {
    const farFuture: Countdown = {
      ...mockCountdown,
      targetDate: Date.now() + 400 * 24 * 60 * 60 * 1000,
    };
    syncWidget(farFuture);
    const entries: unknown[] = (CountdownWidget.updateTimeline as jest.Mock)
      .mock.calls[0][0];
    expect(entries.length).toBeLessThanOrEqual(366);
  });
});

describe("clearWidget", () => {
  it("calls updateSnapshot with default empty state", () => {
    clearWidget();
    expect(CountdownWidget.updateSnapshot).toHaveBeenCalledWith({
      name: "No Countdown",
      emoji: "⏳",
      daysRemaining: 0,
    });
  });
});
