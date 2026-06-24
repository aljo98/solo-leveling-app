import { describe, expect, it } from "vitest";

import type { CheckIn, QuestHistoryEntry } from "./questTypes";
import { chooseTemplate, generateDailyQuest } from "./questEngine";
import type { PlayerProfile } from "../../storage/storage";

const profile: PlayerProfile = {
  id: "local-player",
  playerName: "Aljaz",
  goal: {
    primary: "shoulders_arms_athletic_base",
    secondary: ["endurance", "posture", "confidence"],
    constraints: [],
    equipment: ["none", "resistance_band", "jump_rope"]
  },
  mentorTone: "steady_coach",
  createdAt: "2026-06-24T00:00:00.000Z"
};

const baseCheckIn: CheckIn = {
  date: "2026-06-24",
  energy: 4,
  mood: 4,
  focus: 4,
  stress: 2,
  bodyPain: false,
  timeAvailableMin: 20
};

describe("generateDailyQuest", () => {
  it("creates a strength quest for green days with 20 or 40 minutes", () => {
    const quest = generateDailyQuest(baseCheckIn, profile, []);
    expect(quest.category).toBe("strength");
    expect(quest.dayMode).toBe("green");
    expect(quest.steps.length).toBeGreaterThan(3);
  });

  it("creates a minimum quest for red days", () => {
    const quest = generateDailyQuest({ ...baseCheckIn, energy: 2 }, profile, []);
    expect(quest.category).toBe("minimum");
    expect(quest.durationMin).toBe(5);
  });

  it("routes body pain to recovery mobility", () => {
    const quest = generateDailyQuest(
      { ...baseCheckIn, bodyPain: true },
      profile,
      []
    );
    expect(quest.category).toBe("recovery");
    expect(quest.title).toContain("Recovery");
  });

  it("avoids another high intensity day after yesterday was hard", () => {
    const history: QuestHistoryEntry[] = [
      {
        date: "2026-06-23",
        questId: "2026-06-23-strength_shoulders_arms_base",
        category: "strength",
        dayMode: "green",
        status: "completed",
        intensity: "high"
      }
    ];

    expect(chooseTemplate(baseCheckIn, profile, history)).toBe("cardio_easy");
  });
});
