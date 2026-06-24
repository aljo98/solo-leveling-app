import type { CheckIn, DayMode } from "../quest/questTypes";

export function determineDayMode(checkIn: CheckIn): DayMode {
  if (checkIn.mood === 1 && checkIn.energy <= 2) return "crisis";
  if (checkIn.bodyPain) return "red";
  if (checkIn.energy <= 2 || checkIn.mood <= 2 || checkIn.focus <= 2) {
    return "red";
  }
  if (checkIn.energy === 3 || checkIn.mood === 3 || checkIn.stress >= 4) {
    return "yellow";
  }
  return "green";
}

export function isLowPressureMode(mode: DayMode) {
  return mode === "red" || mode === "crisis";
}
