import {
  addCountdown,
  deleteAllCountdowns,
  deleteCountdown,
  getActiveWidgetCountdownId,
  getCountdowns,
  initDB,
  setActiveWidgetCountdownId,
  updateCountdown,
} from "@/db/database";
import { describe, expect, it, jest } from "@jest/globals";
import type { SQLiteDatabase } from "expo-sqlite";

function makeDb(overrides: Record<string, unknown> = {}): SQLiteDatabase {
  return {
    execAsync: jest.fn(async () => undefined),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getAllAsync: jest.fn(async () => []),
    getFirstAsync: jest.fn(async () => null),
    ...overrides,
  } as unknown as SQLiteDatabase;
}

describe("initDB", () => {
  it("calls execAsync with CREATE TABLE statements", async () => {
    const db = makeDb();
    await initDB(db);
    expect(db.execAsync).toHaveBeenCalledTimes(1);
    const sql = (
      db.execAsync as jest.MockedFunction<SQLiteDatabase["execAsync"]>
    ).mock.calls[0][0] as string;
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS countdowns");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS settings");
  });
});

describe("getCountdowns", () => {
  it("returns rows from db.getAllAsync", async () => {
    const mockRows = [
      {
        id: 1,
        name: "Test",
        emoji: "🎉",
        targetDate: 9999999,
        createdAt: 1000,
      },
    ];
    const db = makeDb({ getAllAsync: jest.fn(async () => mockRows) });
    const result = await getCountdowns(db);
    expect(result).toEqual(mockRows);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
    );
  });
});

describe("addCountdown", () => {
  it("inserts and returns the new countdown with lastInsertRowId", async () => {
    const db = makeDb({
      runAsync: jest.fn(async () => ({ lastInsertRowId: 42, changes: 1 })),
    });
    const input = {
      name: "Birthday",
      emoji: "🎂",
      targetDate: 2000000,
      createdAt: 1000,
    };
    const result = await addCountdown(db, input);
    expect(result.id).toBe(42);
    expect(result.name).toBe("Birthday");
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO countdowns"),
      expect.arrayContaining(["Birthday", "🎂"]),
    );
  });
});

describe("deleteCountdown", () => {
  it("calls runAsync with DELETE statement and correct id", async () => {
    const db = makeDb();
    await deleteCountdown(db, 5);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM countdowns WHERE id"),
      [5],
    );
  });
});

describe("updateCountdown", () => {
  it("updates a countdown by id with new fields", async () => {
    const db = makeDb();
    await updateCountdown(db, 5, {
      name: "Updated",
      emoji: "🛠️",
      targetDate: 1234567890,
    });
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE countdowns SET"),
      ["Updated", "🛠️", 1234567890, 5],
    );
  });
});

describe("deleteAllCountdowns", () => {
  it("deletes all rows and resets the active widget id setting", async () => {
    const db = makeDb();
    await deleteAllCountdowns(db);
    expect(db.runAsync).toHaveBeenCalledTimes(2);
    const calls = (
      db.runAsync as jest.MockedFunction<SQLiteDatabase["runAsync"]>
    ).mock.calls;
    expect(calls[0][0]).toContain("DELETE FROM countdowns");
    const settingsCall = calls[1];
    expect(settingsCall[0]).toContain("UPDATE settings");
    expect(settingsCall[0]).toContain("activeWidgetCountdownId");
  });
});

describe("getActiveWidgetCountdownId", () => {
  it("returns null when no row is found", async () => {
    const db = makeDb({ getFirstAsync: jest.fn(async () => null) });
    const result = await getActiveWidgetCountdownId(db);
    expect(result).toBeNull();
  });

  it("returns the parsed integer when a row exists", async () => {
    const db = makeDb({
      getFirstAsync: jest.fn(async () => ({ value: "7" })),
    });
    const result = await getActiveWidgetCountdownId(db);
    expect(result).toBe(7);
  });
});

describe("setActiveWidgetCountdownId", () => {
  it("stores string representation of id", async () => {
    const db = makeDb();
    await setActiveWidgetCountdownId(db, 3);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE settings"),
      ["3"],
    );
  });

  it("stores null when id is null", async () => {
    const db = makeDb();
    await setActiveWidgetCountdownId(db, null);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE settings"),
      [null],
    );
  });
});
