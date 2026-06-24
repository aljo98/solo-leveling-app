import type {
  BodyGoal,
  CheckIn,
  Equipment,
  PlayerStat,
  Quest,
  QuestCategory,
  QuestHistoryEntry
} from "../core/quest/questTypes";
import type { XpByStat } from "../core/xp/xpTypes";

export type PlayerProfile = {
  id: string;
  playerName: string;
  goal: BodyGoal;
  mentorTone: "steady_coach" | "direct_system" | "quiet_rival";
  createdAt: string;
};

export type QuestLogRecord = {
  id: string;
  questId: string;
  questTitle: string;
  category: QuestCategory;
  dayMode: Quest["dayMode"];
  date: string;
  status: "completed" | "paused" | "stopped_safely";
  completedStepIds: string[];
  xpTotal: number;
  xpByStat: XpByStat;
  comebackBonus: number;
  createdAt: string;
};

export type JournalReflection = {
  id: string;
  questId?: string;
  questStatus?: QuestLogRecord["status"];
  date: string;
  effort: 1 | 2 | 3 | 4 | 5;
  moodAfter: 1 | 2 | 3 | 4 | 5;
  painAfter: boolean;
  note?: string;
  createdAt: string;
};

export type LocalSnapshot = {
  profile?: PlayerProfile;
  todayCheckIn?: CheckIn;
  todayQuest?: Quest;
  questLogs: QuestLogRecord[];
  journalReflections: JournalReflection[];
  xpTotals: XpByStat;
  history: QuestHistoryEntry[];
  activeDays7: number;
  activeDays14: number;
};

export interface AppStorage {
  loadSnapshot(): Promise<LocalSnapshot>;
  saveProfile(profile: PlayerProfile): Promise<void>;
  saveDailyPlan(checkIn: CheckIn, quest: Quest): Promise<void>;
  getQuestById(id: string): Promise<Quest | null>;
  saveQuestLog(log: QuestLogRecord): Promise<void>;
  addXp(xp: XpByStat): Promise<void>;
  saveJournalReflection(reflection: JournalReflection): Promise<void>;
}

export const defaultBodyGoal: BodyGoal = {
  primary: "shoulders_arms_athletic_base",
  secondary: ["endurance", "posture", "confidence"],
  constraints: [],
  equipment: ["none" satisfies Equipment]
};

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function lastNDays(count: number, date = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    value.setUTCDate(value.getUTCDate() - (count - 1 - index));
    return value.toISOString().slice(0, 10);
  });
}

export function createEmptyXpTotals(): XpByStat {
  return {
    strength: 0,
    endurance: 0,
    mobility: 0,
    recovery: 0,
    focus: 0,
    discipline: 0,
    mindset: 0
  };
}
