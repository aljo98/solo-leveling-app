export type Equipment =
  | "none"
  | "jump_rope"
  | "resistance_band"
  | "pullup_bar"
  | "rings"
  | "dumbbells";

export type BodyGoal = {
  primary: "shoulders_arms_athletic_base";
  secondary: ("endurance" | "posture" | "confidence")[];
  constraints: string[];
  equipment: Equipment[];
};

export type Rating = 1 | 2 | 3 | 4 | 5;

export type CheckIn = {
  date: string;
  energy: Rating;
  mood: Rating;
  focus: Rating;
  stress: Rating;
  bodyPain: boolean;
  timeAvailableMin: 5 | 10 | 20 | 40;
  note?: string;
};

export type DayMode = "green" | "yellow" | "red" | "crisis";

export type QuestCategory =
  | "strength"
  | "endurance"
  | "mobility"
  | "recovery"
  | "journal"
  | "minimum";

export type QuestStep = {
  id: string;
  label: string;
  instruction: string;
  targetReps?: number;
  targetSeconds?: number;
  restSeconds?: number;
};

export type Quest = {
  id: string;
  title: string;
  category: QuestCategory;
  dayMode: DayMode;
  durationMin: number;
  xpReward: number;
  reason: string;
  steps: QuestStep[];
};

export type PlayerStat =
  | "strength"
  | "endurance"
  | "mobility"
  | "recovery"
  | "focus"
  | "discipline"
  | "mindset";

export type QuestHistoryEntry = {
  date: string;
  questId: string;
  category: QuestCategory;
  dayMode: DayMode;
  status: "completed" | "paused" | "stopped_safely";
  intensity: "low" | "medium" | "high";
};
