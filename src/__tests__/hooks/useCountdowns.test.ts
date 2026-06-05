import { useCountdowns } from "@/hooks/useCountdowns";
import type { Countdown } from "@/types";
import { act, renderHook, waitFor } from "@testing-library/react-native";

// ─── Mock expo-sqlite ────────────────────────────────────────────────────────

let mockCountdowns: Countdown[] = [];
let nextId = 1;
let activeWidgetId: string | null = null;

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));

function setupMockDb() {
  mockDb.getAllAsync.mockImplementation(async () => [...mockCountdowns]);
  mockDb.getFirstAsync.mockImplementation(async () =>
    activeWidgetId != null ? { value: activeWidgetId } : null,
  );
  mockDb.runAsync.mockImplementation(
    async (sql: string, params?: unknown[]) => {
      if (sql.includes("INSERT INTO countdowns")) {
        const id = nextId++;
        mockCountdowns.push({
          id,
          name: params![0] as string,
          emoji: params![1] as string,
          targetDate: params![2] as number,
          createdAt: params![3] as number,
        });
        return { lastInsertRowId: id, changes: 1 };
      }
      if (sql.includes("DELETE FROM countdowns WHERE id")) {
        mockCountdowns = mockCountdowns.filter(
          (c) => c.id !== (params![0] as number),
        );
        return { lastInsertRowId: 0, changes: 1 };
      }
      if (sql.includes("UPDATE countdowns SET")) {
        const id = params![3] as number;
        mockCountdowns = mockCountdowns.map((c) =>
          c.id === id
            ? {
                ...c,
                name: params![0] as string,
                emoji: params![1] as string,
                targetDate: params![2] as number,
              }
            : c,
        );
        return { lastInsertRowId: 0, changes: 1 };
      }
      if (sql.includes("DELETE FROM countdowns")) {
        mockCountdowns = [];
        return { lastInsertRowId: 0, changes: 1 };
      }
      if (sql.includes("UPDATE settings") && params) {
        activeWidgetId = params[0] != null ? String(params[0]) : null;
      }
      return { lastInsertRowId: 0, changes: 1 };
    },
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockCountdowns = [];
  activeWidgetId = null;
  nextId = 1;
  jest.clearAllMocks();
  setupMockDb();
});

const future = Date.now() + 86400000;

describe("useCountdowns", () => {
  it("starts with empty countdowns and isLoading resolves to false", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.countdowns).toEqual([]);
  });

  it("adds a countdown and updates state", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({
        name: "Trip",
        emoji: "🌴",
        targetDate: future,
      });
    });

    expect(result.current.countdowns).toHaveLength(1);
    expect(result.current.countdowns[0].name).toBe("Trip");
    expect(result.current.countdowns[0].emoji).toBe("🌴");
  });

  it("removes a countdown by id", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({
        name: "Trip",
        emoji: "🌴",
        targetDate: future,
      });
    });
    expect(result.current.countdowns).toHaveLength(1);

    const id = result.current.countdowns[0].id;
    await act(async () => {
      await result.current.remove(id);
    });

    expect(result.current.countdowns).toHaveLength(0);
  });

  it("edits a countdown by id", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({
        name: "Trip",
        emoji: "🌴",
        targetDate: future,
      });
    });

    const id = result.current.countdowns[0].id;

    await act(async () => {
      await result.current.edit(id, {
        name: "Updated Trip",
        emoji: "✈️",
        targetDate: future + 86400000,
      });
    });

    expect(result.current.countdowns[0].name).toBe("Updated Trip");
    expect(result.current.countdowns[0].emoji).toBe("✈️");
    expect(result.current.countdowns[0].targetDate).toBe(future + 86400000);
  });

  it("removes all countdowns and resets widget id", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({ name: "A", emoji: "🅰️", targetDate: future });
      await result.current.add({ name: "B", emoji: "🅱️", targetDate: future });
    });
    expect(result.current.countdowns).toHaveLength(2);

    await act(async () => {
      await result.current.removeAll();
    });
    expect(result.current.countdowns).toHaveLength(0);
    expect(result.current.activeWidgetCountdownId).toBeNull();
  });

  it("sets and clears the active widget countdown id", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setWidgetCountdown(42);
    });
    expect(result.current.activeWidgetCountdownId).toBe(42);

    await act(async () => {
      await result.current.setWidgetCountdown(null);
    });
    expect(result.current.activeWidgetCountdownId).toBeNull();
  });

  it("clears activeWidgetCountdownId when the active countdown is deleted", async () => {
    const { result } = await renderHook(() => useCountdowns());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({
        name: "Trip",
        emoji: "✈️",
        targetDate: future,
      });
    });
    const id = result.current.countdowns[0].id;
    await act(async () => {
      await result.current.setWidgetCountdown(id);
    });
    expect(result.current.activeWidgetCountdownId).toBe(id);

    await act(async () => {
      await result.current.remove(id);
    });
    expect(result.current.activeWidgetCountdownId).toBeNull();
    expect(result.current.countdowns).toHaveLength(0);
  });
});
