import { useEffect } from "react";
import type { Countdown } from "@/types";
import CountdownWidget from "@/widgets/CountdownWidget";

function getDaysRemaining(targetDate: number): number {
  const now = Date.now();
  const diff = targetDate - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function syncWidget(countdown: Countdown): void {
  const now = new Date();
  const target = new Date(countdown.targetDate);
  const entries: { date: Date; props: { name: string; emoji: string; daysRemaining: number } }[] = [];

  // Generate one timeline entry per day from now until target (max 365 entries)
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil((target.getTime() - now.getTime()) / msPerDay);

  // Countdown is expired or due today
  if (totalDays <= 0) {
    CountdownWidget.updateSnapshot({
      name: countdown.name,
      emoji: countdown.emoji,
      daysRemaining: 0,
    });
    return;
  }

  const cappedDays = Math.min(totalDays, 365);
  for (let i = 0; i <= cappedDays; i++) {
    const entryDate = new Date(now.getTime() + i * msPerDay);
    entries.push({
      date: entryDate,
      props: {
        name: countdown.name,
        emoji: countdown.emoji,
        daysRemaining: Math.max(
          0,
          getDaysRemaining(countdown.targetDate) - i
        ),
      },
    });
  }

  if (entries.length === 0) {
    CountdownWidget.updateSnapshot({
      name: countdown.name,
      emoji: countdown.emoji,
      daysRemaining: 0,
    });
  } else {
    CountdownWidget.updateTimeline(entries);
  }
}

export function clearWidget(): void {
  CountdownWidget.updateSnapshot({
    name: "No Countdown",
    emoji: "⏳",
    daysRemaining: 0,
  });
}

export function useWidgetSync(
  countdowns: Countdown[],
  activeWidgetCountdownId: number | null
): void {
  useEffect(() => {
    if (activeWidgetCountdownId == null) {
      clearWidget();
      return;
    }
    const active = countdowns.find((c) => c.id === activeWidgetCountdownId);
    if (active) {
      syncWidget(active);
    }
  }, [countdowns, activeWidgetCountdownId]);
}
