import { describe, expect, it } from "vitest";

import type { CheckIn } from "../quest/questTypes";
import { determineDayMode } from "./dayMode";

const baseCheckIn: CheckIn = {
  date: "2026-06-24",
  energy: 4,
  mood: 4,
  focus: 4,
  stress: 2,
  bodyPain: false,
  timeAvailableMin: 20
};

describe("determineDayMode", () => {
  it("returns crisis for very low mood and low energy", () => {
    expect(determineDayMode({ ...baseCheckIn, mood: 1, energy: 2 })).toBe(
      "crisis"
    );
  });

  it("returns red when body pain is present", () => {
    expect(determineDayMode({ ...baseCheckIn, bodyPain: true })).toBe("red");
  });

  it("returns red for low energy, mood, or focus", () => {
    expect(determineDayMode({ ...baseCheckIn, energy: 2 })).toBe("red");
    expect(determineDayMode({ ...baseCheckIn, mood: 2 })).toBe("red");
    expect(determineDayMode({ ...baseCheckIn, focus: 2 })).toBe("red");
  });

  it("returns yellow for medium signal or high stress", () => {
    expect(determineDayMode({ ...baseCheckIn, energy: 3 })).toBe("yellow");
    expect(determineDayMode({ ...baseCheckIn, stress: 4 })).toBe("yellow");
  });

  it("returns green when readiness signal is clear", () => {
    expect(determineDayMode(baseCheckIn)).toBe("green");
  });
});
