import type { Quest, QuestStep } from "../quest/questTypes";

export type WorkoutPlan = {
  questId: string;
  steps: QuestStep[];
  estimatedMinutes: number;
};

export function createWorkoutPlan(quest: Quest): WorkoutPlan {
  return {
    questId: quest.id,
    steps: quest.steps,
    estimatedMinutes: quest.durationMin
  };
}
