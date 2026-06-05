import type { Countdown } from "@/types";
import * as SQLite from "expo-sqlite";

export async function initDB(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS countdowns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      targetDate INTEGER NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO settings (key, value)
    VALUES ('activeWidgetCountdownId', NULL);
  `);
}

export async function getCountdowns(
  db: SQLite.SQLiteDatabase,
): Promise<Countdown[]> {
  return db.getAllAsync<Countdown>(
    "SELECT id, name, emoji, targetDate, createdAt FROM countdowns ORDER BY createdAt DESC",
  );
}

export async function addCountdown(
  db: SQLite.SQLiteDatabase,
  countdown: Omit<Countdown, "id">,
): Promise<Countdown> {
  const result = await db.runAsync(
    "INSERT INTO countdowns (name, emoji, targetDate, createdAt) VALUES (?, ?, ?, ?)",
    [
      countdown.name,
      countdown.emoji,
      countdown.targetDate,
      countdown.createdAt,
    ],
  );
  return {
    id: result.lastInsertRowId,
    ...countdown,
  };
}

export async function deleteCountdown(
  db: SQLite.SQLiteDatabase,
  id: number,
): Promise<void> {
  await db.runAsync("DELETE FROM countdowns WHERE id = ?", [id]);
}

export async function updateCountdown(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: Pick<Countdown, "name" | "emoji" | "targetDate">,
): Promise<void> {
  await db.runAsync(
    "UPDATE countdowns SET name = ?, emoji = ?, targetDate = ? WHERE id = ?",
    [input.name, input.emoji, input.targetDate, id],
  );
}

export async function deleteAllCountdowns(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  await db.runAsync("DELETE FROM countdowns");
  await db.runAsync(
    "UPDATE settings SET value = NULL WHERE key = 'activeWidgetCountdownId'",
  );
}

export async function getActiveWidgetCountdownId(
  db: SQLite.SQLiteDatabase,
): Promise<number | null> {
  const row = await db.getFirstAsync<{ value: string | null }>(
    "SELECT value FROM settings WHERE key = 'activeWidgetCountdownId'",
  );
  if (row?.value == null) return null;
  return parseInt(row.value, 10);
}

export async function setActiveWidgetCountdownId(
  db: SQLite.SQLiteDatabase,
  id: number | null,
): Promise<void> {
  await db.runAsync(
    "UPDATE settings SET value = ? WHERE key = 'activeWidgetCountdownId'",
    [id != null ? String(id) : null],
  );
}
