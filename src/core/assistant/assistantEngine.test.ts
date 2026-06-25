import { describe, expect, it } from "vitest";

import type { Quest } from "../quest/questTypes";
import { generateLocalAssistantReply } from "./assistantEngine";
import { adaptQuestDifficulty, createCustomExerciseQuest } from "./exerciseCoach";

const quest: Quest = {
  id: "today-strength",
  title: "Shoulders / Arms Base",
  category: "strength",
  dayMode: "green",
  durationMin: 20,
  xpReward: 40,
  reason: "Main route.",
  steps: [
    { id: "push", label: "Push-ups", instruction: "Clean reps.", targetReps: 10 },
    { id: "row", label: "Rows", instruction: "Pull clean.", targetReps: 10 }
  ]
};

const context = {
  playerName: "Aljaz",
  todayQuest: quest,
  activeDays7: 2,
  activeDays14: 3,
  totalXp: 120
};

describe("assistantEngine", () => {
  it("reviews today's quest locally", () => {
    const reply = generateLocalAssistantReply("preglej quest", context);
    expect(reply.message.text).toContain("Pregled");
  });

  it("suggests easier quest adaptation", () => {
    const reply = generateLocalAssistantReply("naredi lažje", context);
    expect(reply.suggestedQuest?.title).toContain("easier");
    expect(reply.suggestedQuest?.xpReward).toBeLessThan(quest.xpReward);
  });

  it("creates mobility quest from prompt", () => {
    const created = createCustomExerciseQuest(context, "ustvari 10 min mobility");
    expect(created.category).toBe("mobility");
    expect(created.steps.length).toBeGreaterThan(2);
  });

  it("does not increase red day pressure", () => {
    const redQuest = { ...quest, dayMode: "red" as const };
    const adapted = adaptQuestDifficulty(redQuest, "harder");
    expect(adapted.xpReward).toBe(redQuest.xpReward);
  });
});
