import type { Quest, QuestStep } from "./questTypes";

export type QuestTemplateId =
  | "strength_shoulders_arms_base"
  | "short_strength_yellow"
  | "minimum_red"
  | "cardio_easy"
  | "recovery_mobility"
  | "crisis_grounding";

type QuestTemplate = Omit<Quest, "id" | "dayMode"> & {
  templateId: QuestTemplateId;
  intensity: "low" | "medium" | "high";
};

const strengthSteps: QuestStep[] = [
  {
    id: "warmup-shoulder-circles",
    label: "Warmup shoulder circles",
    instruction: "Move slowly both directions. Keep neck soft.",
    targetSeconds: 60
  },
  {
    id: "pushup-progression",
    label: "Incline or normal push-ups",
    instruction: "Three smooth sets. Stop one rep before form breaks.",
    targetReps: 8,
    restSeconds: 60
  },
  {
    id: "row-progression",
    label: "Resistance band row or inverted row",
    instruction: "Three sets. Pull elbows back, pause, then lower with control.",
    targetReps: 10,
    restSeconds: 60
  },
  {
    id: "pike-pushup",
    label: "Pike push-up progression",
    instruction: "Two controlled sets. Use a smaller angle if shoulders complain.",
    targetReps: 6,
    restSeconds: 75
  },
  {
    id: "plank",
    label: "Plank",
    instruction: "Two holds. Breathe slowly and stop before shaking turns messy.",
    targetSeconds: 30,
    restSeconds: 60
  }
];

const yellowSteps: QuestStep[] = [
  {
    id: "easy-warmup",
    label: "2 min easy warmup",
    instruction: "Walk, shake out arms, and let the body arrive.",
    targetSeconds: 120
  },
  {
    id: "incline-pushups",
    label: "Incline push-ups",
    instruction: "Two sets. Hands higher means easier.",
    targetReps: 8,
    restSeconds: 45
  },
  {
    id: "squats",
    label: "Squats",
    instruction: "Two easy sets. Keep feet grounded and pace calm.",
    targetReps: 12,
    restSeconds: 45
  },
  {
    id: "band-or-towel-rows",
    label: "Band rows or towel rows",
    instruction: "Two sets. Pull shoulder blades back without rushing.",
    targetReps: 10,
    restSeconds: 45
  },
  {
    id: "breath-reset",
    label: "Breath reset",
    instruction: "Slow nasal inhale, longer exhale. Let the session land.",
    targetSeconds: 60
  }
];

const minimumSteps: QuestStep[] = [
  {
    id: "water",
    label: "Stand up and drink water",
    instruction: "No setup. Just make the first small move."
  },
  {
    id: "wall-or-incline-pushups",
    label: "10 wall push-ups or 5 incline push-ups",
    instruction: "Pick the version that feels almost too easy.",
    targetReps: 10
  },
  {
    id: "squats-or-walk",
    label: "20 bodyweight squats or 2 min walk",
    instruction: "Choose the kinder option for today.",
    targetReps: 20
  },
  {
    id: "slow-breaths",
    label: "3 slow breaths",
    instruction: "Exhale slowly. Let the system mark a return to rhythm."
  },
  {
    id: "today-counts",
    label: "Mark today as still counted",
    instruction: "Minimum quest completed. Today still counts."
  }
];

const cardioSteps: QuestStep[] = [
  {
    id: "warmup-walk",
    label: "Warmup walk",
    instruction: "Easy pace. Keep shoulders low.",
    targetSeconds: 180
  },
  {
    id: "easy-intervals",
    label: "Jump rope intervals or easy run",
    instruction: "Stay conversational. Switch to walking before it becomes a grind.",
    targetSeconds: 720
  },
  {
    id: "cooldown-walk",
    label: "Cooldown walk",
    instruction: "Walk until breathing is calm.",
    targetSeconds: 120
  }
];

const recoverySteps: QuestStep[] = [
  {
    id: "neck-reset",
    label: "Neck reset",
    instruction: "Gentle range only. No forcing.",
    targetSeconds: 45
  },
  {
    id: "shoulder-mobility",
    label: "Shoulder mobility",
    instruction: "Slow shoulder circles and wall slides.",
    targetSeconds: 90
  },
  {
    id: "doorway-stretch",
    label: "Chest doorway stretch",
    instruction: "Light stretch, easy breathing.",
    targetSeconds: 60
  },
  {
    id: "calm-breathing",
    label: "2 min calm breathing",
    instruction: "Long exhale. Let this be enough.",
    targetSeconds: 120
  }
];

const crisisSteps: QuestStep[] = [
  {
    id: "feet-floor",
    label: "Feet on floor",
    instruction: "Notice contact with the ground. No performance target.",
    targetSeconds: 30
  },
  {
    id: "name-room",
    label: "Name three things in the room",
    instruction: "Quietly name three visible things and one next tiny action."
  },
  {
    id: "trusted-person",
    label: "Optional trusted person check",
    instruction: "Send a short message if connection would help right now."
  },
  {
    id: "minimum-choice",
    label: "Choose whether a minimum quest feels okay",
    instruction: "No pressure. Stopping here is a safe route."
  }
];

export const questTemplates: Record<QuestTemplateId, QuestTemplate> = {
  strength_shoulders_arms_base: {
    templateId: "strength_shoulders_arms_base",
    title: "Shoulders / Arms Base",
    category: "strength",
    durationMin: 24,
    xpReward: 42,
    reason:
      "Energy and time are high enough for the main body route: push, pull, shoulders, and core.",
    steps: strengthSteps,
    intensity: "high"
  },
  short_strength_yellow: {
    templateId: "short_strength_yellow",
    title: "Short Strength Route",
    category: "strength",
    durationMin: 14,
    xpReward: 28,
    reason:
      "Today asks for a controlled session: enough work to count, not enough to drain the day.",
    steps: yellowSteps,
    intensity: "medium"
  },
  minimum_red: {
    templateId: "minimum_red",
    title: "Minimum Quest",
    category: "minimum",
    durationMin: 5,
    xpReward: 14,
    reason:
      "Low signal detected. The route shrinks to a tiny next step so today still counts.",
    steps: minimumSteps,
    intensity: "low"
  },
  cardio_easy: {
    templateId: "cardio_easy",
    title: "Easy Cardio Route",
    category: "endurance",
    durationMin: 15,
    xpReward: 30,
    reason:
      "A lighter endurance route builds consistency without stacking another heavy strength day.",
    steps: cardioSteps,
    intensity: "medium"
  },
  recovery_mobility: {
    templateId: "recovery_mobility",
    title: "Recovery Mobility Route",
    category: "recovery",
    durationMin: 8,
    xpReward: 18,
    reason:
      "Pain or recovery signal takes priority. Mobility keeps the body connected without pressure.",
    steps: recoverySteps,
    intensity: "low"
  },
  crisis_grounding: {
    templateId: "crisis_grounding",
    title: "Grounding Route",
    category: "recovery",
    durationMin: 4,
    xpReward: 0,
    reason:
      "Very low mood and energy signal. This route offers grounding only, with no pressure.",
    steps: crisisSteps,
    intensity: "low"
  }
};

export function createQuestFromTemplate(
  templateId: QuestTemplateId,
  dayMode: Quest["dayMode"],
  date: string
): Quest {
  const template = questTemplates[templateId];
  return {
    id: `${date}-${template.templateId}`,
    title: template.title,
    category: template.category,
    dayMode,
    durationMin: template.durationMin,
    xpReward: template.xpReward,
    reason: template.reason,
    steps: template.steps
  };
}

export function getTemplateIntensity(templateId: QuestTemplateId) {
  return questTemplates[templateId].intensity;
}
