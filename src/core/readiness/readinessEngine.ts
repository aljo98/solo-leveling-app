import type { CheckIn, DayMode } from "../quest/questTypes";
import { determineDayMode } from "./dayMode";

export type ReadinessSummary = {
  mode: DayMode;
  title: string;
  guidance: string;
  tinyStep: string;
};

export function buildReadinessSummary(checkIn: CheckIn): ReadinessSummary {
  const mode = determineDayMode(checkIn);

  if (mode === "crisis") {
    return {
      mode,
      title: "Crisis route",
      guidance:
        "No pressure route. Contact a trusted person if that helps, then try one grounding action.",
      tinyStep: "Put both feet on the floor and take three slow breaths."
    };
  }

  if (mode === "red") {
    return {
      mode,
      title: "Recovery route activated",
      guidance:
        "The system is choosing a tiny route so today stays gentle and visible.",
      tinyStep: "Stand up, drink water, and choose the smallest version."
    };
  }

  if (mode === "yellow") {
    return {
      mode,
      title: "Yellow route",
      guidance:
        "A short controlled quest fits today better than a hero session.",
      tinyStep: "Start the warmup and reassess after two minutes."
    };
  }

  return {
    mode,
    title: "Green route",
    guidance: "Good enough signal for the main body quest.",
    tinyStep: "Start with shoulder circles and keep reps smooth."
  };
}
