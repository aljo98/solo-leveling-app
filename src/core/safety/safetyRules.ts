import type { DayMode } from "../quest/questTypes";

export const blockedUxTerms = [
  "failed",
  "lazy",
  "weak",
  "streak broken",
  "missed workout",
  "punishment"
] as const;

export const preferredUxTerms = [
  "quest paused",
  "recovery route activated",
  "comeback bonus available",
  "minimum quest completed",
  "return to rhythm",
  "today still counts"
] as const;

export function getSafetyStopCopy(mode: DayMode) {
  if (mode === "crisis") {
    return "Stopping here is a valid route. Reach out to a trusted person if connection would help right now.";
  }
  if (mode === "red") {
    return "Stop safely keeps the day honest and kind. Recovery route activated.";
  }
  return "Stop safely if form, pain, or focus changes. The next tiny step can wait.";
}

export function containsBlockedUxLanguage(message: string) {
  const normalized = message.toLowerCase();
  return blockedUxTerms.some((term) => normalized.includes(term));
}
