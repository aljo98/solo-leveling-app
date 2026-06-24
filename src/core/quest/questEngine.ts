import { determineDayMode } from "../readiness/dayMode";
import type {
  CheckIn,
  PlayerStat,
  Quest,
  QuestCategory,
  QuestHistoryEntry
} from "./questTypes";
import {
  createQuestFromTemplate,
  getTemplateIntensity,
  type QuestTemplateId
} from "./questTemplates";
import type { PlayerProfile } from "../../storage/storage";

export function generateDailyQuest(
  checkIn: CheckIn,
  profile: PlayerProfile,
  history: QuestHistoryEntry[] = []
): Quest {
  const mode = determineDayMode(checkIn);
  const templateId = chooseTemplate(checkIn, profile, history);
  const questMode = templateId === "recovery_mobility" && mode === "green" ? "yellow" : mode;

  return createQuestFromTemplate(templateId, questMode, checkIn.date);
}

export function chooseTemplate(
  checkIn: CheckIn,
  profile: Pick<PlayerProfile, "goal">,
  history: QuestHistoryEntry[] = []
): QuestTemplateId {
  const mode = determineDayMode(checkIn);

  if (mode === "crisis") return "crisis_grounding";
  if (checkIn.bodyPain) return "recovery_mobility";

  if (mode === "red") return "minimum_red";

  const yesterdayHard = wasYesterdayHard(checkIn.date, history);
  if (yesterdayHard) {
    return profile.goal.equipment.includes("jump_rope") && checkIn.timeAvailableMin >= 10
      ? "cardio_easy"
      : "recovery_mobility";
  }

  if (mode === "yellow") return "short_strength_yellow";

  if (checkIn.timeAvailableMin >= 20) return "strength_shoulders_arms_base";
  if (checkIn.timeAvailableMin === 10) return "cardio_easy";

  return "minimum_red";
}

export function getQuestIntensity(quest: Quest): QuestHistoryEntry["intensity"] {
  const template = quest.id.split("-").slice(1).join("-") as QuestTemplateId;
  if (template in templateIntensityById) {
    return templateIntensityById[template];
  }
  if (quest.category === "strength" && quest.durationMin >= 20) return "high";
  if (quest.category === "minimum" || quest.category === "recovery") return "low";
  return "medium";
}

export function mapQuestCategoryToPrimaryStat(
  category: QuestCategory
): PlayerStat {
  if (category === "strength") return "strength";
  if (category === "endurance") return "endurance";
  if (category === "mobility") return "mobility";
  if (category === "journal") return "mindset";
  if (category === "minimum") return "discipline";
  return "recovery";
}

function wasYesterdayHard(date: string, history: QuestHistoryEntry[]) {
  const yesterday = offsetDate(date, -1);
  return history.some(
    (entry) =>
      entry.date === yesterday &&
      entry.status === "completed" &&
      entry.intensity === "high"
  );
}

function offsetDate(date: string, amount: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

const templateIntensityById = {
  strength_shoulders_arms_base: getTemplateIntensity("strength_shoulders_arms_base"),
  short_strength_yellow: getTemplateIntensity("short_strength_yellow"),
  minimum_red: getTemplateIntensity("minimum_red"),
  cardio_easy: getTemplateIntensity("cardio_easy"),
  recovery_mobility: getTemplateIntensity("recovery_mobility"),
  crisis_grounding: getTemplateIntensity("crisis_grounding")
} satisfies Record<QuestTemplateId, QuestHistoryEntry["intensity"]>;
