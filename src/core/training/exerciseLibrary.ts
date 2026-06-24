import type { Exercise } from "./exerciseTypes";

export const exerciseLibrary: Exercise[] = [
  {
    id: "pushup-progression",
    name: "Push-up progression",
    category: "strength",
    equipment: ["none"],
    cue: "Straight line from shoulders to hips. Leave one rep in reserve.",
    easierVersion: "Move hands to a wall, counter, or bench."
  },
  {
    id: "incline-pushup",
    name: "Incline push-up",
    category: "strength",
    equipment: ["none"],
    cue: "Hands elevated, elbows controlled, chest moves toward support.",
    easierVersion: "Raise the hands higher or reduce reps."
  },
  {
    id: "pike-pushup",
    name: "Pike push-up",
    category: "strength",
    equipment: ["none"],
    cue: "Hips high, head moves between hands, shoulders stay smooth.",
    easierVersion: "Use a smaller hip angle or swap for incline push-ups."
  },
  {
    id: "band-row",
    name: "Resistance band row",
    category: "strength",
    equipment: ["resistance_band"],
    cue: "Pull elbows back, pause, then return with control.",
    easierVersion: "Use lighter band tension or fewer reps."
  },
  {
    id: "squat",
    name: "Bodyweight squat",
    category: "strength",
    equipment: ["none"],
    cue: "Feet grounded, knees track with toes, stand tall.",
    easierVersion: "Sit to a chair and stand back up."
  },
  {
    id: "plank",
    name: "Plank",
    category: "strength",
    equipment: ["none"],
    cue: "Breathe slowly and keep ribs stacked over hips.",
    easierVersion: "Use knees down or shorter holds."
  },
  {
    id: "easy-run",
    name: "Easy run",
    category: "endurance",
    equipment: ["none"],
    cue: "Conversational pace. Walking breaks are part of the route.",
    easierVersion: "Switch to brisk walking."
  },
  {
    id: "jump-rope-easy",
    name: "Jump rope easy intervals",
    category: "endurance",
    equipment: ["jump_rope"],
    cue: "Short relaxed intervals with soft knees.",
    easierVersion: "Shadow rope or walk in place."
  },
  {
    id: "neck-reset",
    name: "Neck reset",
    category: "recovery",
    equipment: ["none"],
    cue: "Small range, easy breath, no forcing.",
    easierVersion: "Hold still and breathe slowly."
  },
  {
    id: "breath-reset",
    name: "Breath reset",
    category: "recovery",
    equipment: ["none"],
    cue: "Longer exhale than inhale.",
    easierVersion: "Take three breaths only."
  }
];
