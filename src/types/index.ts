export interface Countdown {
  id: number;
  name: string;
  emoji: string;
  targetDate: number; // Unix timestamp (milliseconds)
  createdAt: number; // Unix timestamp (milliseconds)
}

export interface CountdownSettings {
  activeWidgetCountdownId: number | null;
}
