import type { Quest, QuestHistoryEntry } from "../quest/questTypes";
import { mapQuestCategoryToPrimaryStat } from "../quest/questEngine";
import type { QuestLogStatus, XpByStat, XpResult } from "./xpTypes";

export const playerStats = [
  "strength",
  "endurance",
  "mobility",
  "recovery",
  "focus",
  "discipline",
  "mindset"
] as const;

export const emptyXpByStat = (): XpByStat => ({
  strength: 0,
  endurance: 0,
  mobility: 0,
  recovery: 0,
  focus: 0,
  discipline: 0,
  mindset: 0
});

export function calculateXp(input: {
  quest: Quest;
  status: QuestLogStatus;
  history?: QuestHistoryEntry[];
  date: string;
  completedStepCount?: number;
}): XpResult {
  const { quest, status, history = [], date, completedStepCount = 0 } = input;
  const completionRatio = quest.steps.length
    ? Math.min(1, completedStepCount / quest.steps.length)
    : 0;
  const statusBase =
    status === "completed"
      ? quest.xpReward
      : status === "paused"
        ? Math.max(4, Math.round(quest.xpReward * Math.max(0.25, completionRatio)))
        : Math.max(3, Math.round(quest.xpReward * Math.max(0.15, completionRatio)));

  const comebackBonus = calculateComebackBonus({
    quest,
    status,
    history,
    date
  });
  const total = statusBase + comebackBonus;
  const byStat = emptyXpByStat();
  const primary = mapQuestCategoryToPrimaryStat(quest.category);

  byStat[primary] += Math.round(total * 0.62);
  byStat.discipline += Math.round(total * 0.25);

  if (quest.dayMode === "red" || quest.dayMode === "crisis") {
    byStat.recovery += Math.round(total * 0.13);
  } else if (quest.category === "strength") {
    byStat.mobility += Math.round(total * 0.13);
  } else {
    byStat.mindset += Math.round(total * 0.13);
  }

  normalizeStatTotal(byStat, total, primary);

  return {
    total,
    byStat,
    comebackBonus,
    message: buildXpMessage(status, comebackBonus)
  };
}

export function calculateComebackBonus(input: {
  quest: Quest;
  status: QuestLogStatus;
  history: QuestHistoryEntry[];
  date: string;
}) {
  const { quest, status, history, date } = input;
  if (status !== "completed") return 0;
  if (quest.dayMode === "red" || quest.category === "minimum") return 8;

  const lastCompleted = history
    .filter((entry) => entry.status === "completed" && entry.date < date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!lastCompleted) return 0;
  return daysBetween(lastCompleted.date, date) >= 2 ? 6 : 0;
}

export function calculateLevel(totalXp: number) {
  const level = Math.floor(totalXp / 100) + 1;
  const currentLevelXp = totalXp % 100;
  return {
    level,
    currentLevelXp,
    nextLevelXp: 100
  };
}

function buildXpMessage(status: QuestLogStatus, comebackBonus: number) {
  if (status === "stopped_safely") return "Safe stop logged. Recovery route respected.";
  if (status === "paused") return "Quest paused. Return to rhythm remains open.";
  if (comebackBonus > 0) return "Comeback bonus available and applied.";
  return "Quest completed. XP applied locally.";
}

function normalizeStatTotal(byStat: XpByStat, total: number, primary: keyof XpByStat) {
  const current = Object.values(byStat).reduce((sum, value) => sum + value, 0);
  const delta = total - current;
  byStat[primary] += delta;
}

function daysBetween(from: string, to: string) {
  const fromTime = Date.parse(`${from}T00:00:00.000Z`);
  const toTime = Date.parse(`${to}T00:00:00.000Z`);
  return Math.round((toTime - fromTime) / 86_400_000);
}
