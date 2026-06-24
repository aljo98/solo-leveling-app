import { describe, expect, it } from "vitest";

import type { Quest, QuestHistoryEntry } from "../quest/questTypes";
import { calculateComebackBonus, calculateXp } from "./xpEngine";

const strengthQuest: Quest = {
  id: "2026-06-24-strength_shoulders_arms_base",
  title: "Shoulders / Arms Base",
  category: "strength",
  dayMode: "green",
  durationMin: 24,
  xpReward: 42,
  reason: "Main body route.",
  steps: [
    { id: "a", label: "A", instruction: "A" },
    { id: "b", label: "B", instruction: "B" }
  ]
};

describe("calculateXp", () => {
  it("allocates completed strength XP across strength, discipline, and mobility", () => {
    const result = calculateXp({
      quest: strengthQuest,
      status: "completed",
      date: "2026-06-24",
      completedStepCount: 2
    });

    expect(result.total).toBe(42);
    expect(result.byStat.strength).toBeGreaterThan(result.byStat.discipline);
    expect(result.byStat.mobility).toBeGreaterThan(0);
  });

  it("applies comeback bonus to red day minimum completion", () => {
    const minimumQuest: Quest = {
      ...strengthQuest,
      id: "2026-06-24-minimum_red",
      title: "Minimum Quest",
      category: "minimum",
      dayMode: "red",
      xpReward: 14
    };

    const result = calculateXp({
      quest: minimumQuest,
      status: "completed",
      date: "2026-06-24",
      completedStepCount: 2
    });

    expect(result.comebackBonus).toBe(8);
    expect(result.total).toBe(22);
    expect(result.message).toContain("Comeback bonus");
  });

  it("keeps safe stop XP small and shame-free", () => {
    const result = calculateXp({
      quest: strengthQuest,
      status: "stopped_safely",
      date: "2026-06-24",
      completedStepCount: 0
    });

    expect(result.total).toBeLessThan(strengthQuest.xpReward);
    expect(result.message).toContain("Safe stop");
  });
});

describe("calculateComebackBonus", () => {
  it("adds a small bonus after a gap from completed quests", () => {
    const history: QuestHistoryEntry[] = [
      {
        date: "2026-06-21",
        questId: "old",
        category: "strength",
        dayMode: "green",
        status: "completed",
        intensity: "medium"
      }
    ];

    expect(
      calculateComebackBonus({
        quest: strengthQuest,
        status: "completed",
        history,
        date: "2026-06-24"
      })
    ).toBe(6);
  });
});
