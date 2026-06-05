import {
    addCountdown,
    deleteAllCountdowns,
    deleteCountdown,
    getActiveWidgetCountdownId,
    getCountdowns,
    setActiveWidgetCountdownId,
} from "@/db/database";
import type { Countdown } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export function useCountdowns() {
  const db = useSQLiteContext();
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [activeWidgetCountdownId, setActiveWidgetCountdownIdState] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [rows, activeId] = await Promise.all([
      getCountdowns(db),
      getActiveWidgetCountdownId(db),
    ]);
    setCountdowns(rows);
    setActiveWidgetCountdownIdState(activeId);
  }, [db]);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const add = useCallback(
    async (input: { name: string; emoji: string; targetDate: number }) => {
      const created = await addCountdown(db, {
        ...input,
        createdAt: Date.now(),
      });
      setCountdowns((prev) => [created, ...prev]);
      return created;
    },
    [db],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteCountdown(db, id);
      setCountdowns((prev) => prev.filter((c) => c.id !== id));
      if (activeWidgetCountdownId === id) {
        await setActiveWidgetCountdownId(db, null);
        setActiveWidgetCountdownIdState(null);
      }
    },
    [db, activeWidgetCountdownId],
  );

  const removeAll = useCallback(async () => {
    await deleteAllCountdowns(db);
    setCountdowns([]);
    setActiveWidgetCountdownIdState(null);
  }, [db]);

  const setWidgetCountdown = useCallback(
    async (id: number | null) => {
      await setActiveWidgetCountdownId(db, id);
      setActiveWidgetCountdownIdState(id);
    },
    [db],
  );

  return {
    countdowns,
    activeWidgetCountdownId,
    isLoading,
    refresh,
    add,
    remove,
    removeAll,
    setWidgetCountdown,
  };
}
