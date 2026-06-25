import type { Quest, QuestStep } from "../quest/questTypes";
import type { AssistantContext } from "./assistantTypes";

export function reviewQuestForToday(context: AssistantContext) {
  const quest = context.todayQuest;
  if (!quest) {
    return "Ni še današnjega questa. Najprej naredi check-in, potem lahko pregledam ali prilagodim predlog.";
  }

  const pressure =
    quest.dayMode === "red" || quest.dayMode === "crisis"
      ? "Današnji izbor je nizek pritisk. Namen je ohraniti stik s telesom, ne dvigovati intenzivnosti."
      : "Današnji izbor je primeren za normalen trening, dokler forma ostane čista in brez bolečine.";

  return [
    `Pregled: ${quest.title}.`,
    pressure,
    `Trajanje: ${quest.durationMin} min. Koraki: ${quest.steps.length}.`,
    "Pragmatično pravilo: če se pojavi bolečina ali forma razpade, uporabi lažjo verzijo ali varno ustavi."
  ].join(" ");
}

export function adaptQuestDifficulty(quest: Quest, direction: "easier" | "harder") {
  if (direction === "harder" && (quest.dayMode === "red" || quest.dayMode === "crisis")) {
    return {
      ...quest,
      id: `${quest.id}-steady`,
      title: `${quest.title} - steady version`,
      reason:
        "Današnji signal ne podpira višje intenzivnosti. Sistem ohranja varno, kontrolirano verzijo.",
      xpReward: quest.xpReward,
      steps: quest.steps
    };
  }

  if (direction === "harder") {
    return {
      ...quest,
      id: `${quest.id}-plus`,
      title: `${quest.title} - plus version`,
      durationMin: quest.durationMin + 4,
      xpReward: quest.xpReward + 6,
      reason:
        "Dodana je majhna progresija. Ne gre za maksimalen dan; cilj je čist volumen.",
      steps: [
        ...quest.steps,
        {
          id: "finisher-control-hold",
          label: "Control finisher",
          instruction: "One clean hold or slow set. Stop before form breaks.",
          targetSeconds: 30
        }
      ]
    };
  }

  return {
    ...quest,
    id: `${quest.id}-easier`,
    title: `${quest.title} - easier version`,
    durationMin: Math.max(4, Math.min(quest.durationMin, 10)),
    xpReward: Math.max(8, Math.round(quest.xpReward * 0.7)),
    reason:
      "Prilagojeno na manjši upor in manj odločanja. Dan še vedno šteje.",
    steps: quest.steps.map(makeStepEasier)
  };
}

export function createCustomExerciseQuest(context: AssistantContext, prompt: string): Quest {
  const lower = prompt.toLowerCase();
  const wantsMobility = lower.includes("mobil") || lower.includes("stretch") || lower.includes("pain");
  const wantsCardio = lower.includes("cardio") || lower.includes("walk") || lower.includes("run") || lower.includes("kolebn");
  const durationMin = lower.includes("5") ? 5 : lower.includes("20") ? 20 : 10;

  if (wantsMobility) {
    return {
      id: `custom-mobility-${Date.now()}`,
      title: "Custom Mobility Reset",
      category: "mobility",
      dayMode: context.todayQuest?.dayMode ?? "yellow",
      durationMin,
      xpReward: durationMin <= 5 ? 10 : 18,
      reason: "Ustvarjeno iz chat zahteve: več kontrole, manj obremenitve.",
      steps: [
        step("neck-reset", "Neck reset", "Small range only. No forcing.", 45),
        step("shoulder-wall", "Shoulder wall slides", "Slow reps, ribs down.", 60),
        step("doorway", "Doorway chest stretch", "Light stretch, easy breath.", 60),
        step("breathing", "Breath reset", "Longer exhale than inhale.", 90)
      ]
    };
  }

  if (wantsCardio) {
    return {
      id: `custom-cardio-${Date.now()}`,
      title: "Custom Easy Cardio",
      category: "endurance",
      dayMode: context.todayQuest?.dayMode ?? "yellow",
      durationMin,
      xpReward: durationMin <= 5 ? 10 : 22,
      reason: "Ustvarjeno kot lahek endurance blok brez nepotrebnega pritiska.",
      steps: [
        step("warmup-walk", "Warmup walk", "Easy pace.", 120),
        step("main-walk", "Brisk walk or easy rope rhythm", "Conversational effort.", durationMin * 45),
        step("cooldown", "Cooldown", "Walk until breathing is calm.", 90)
      ]
    };
  }

  return {
    id: `custom-strength-${Date.now()}`,
    title: "Custom Upper Body Base",
    category: "strength",
    dayMode: context.todayQuest?.dayMode ?? "yellow",
    durationMin,
    xpReward: durationMin <= 5 ? 12 : 24,
    reason: "Ustvarjeno kot kratek push/pull blok za ramena, roke in osnovno držo.",
    steps: [
      step("warmup", "Shoulder circles", "Slow both directions.", 60),
      reps("incline-pushups", "Incline push-ups", "Clean reps. Hands higher if needed.", 8),
      reps("rows", "Band or towel rows", "Pull shoulder blades back.", 10),
      step("plank", "Short plank", "Stop before shaking turns messy.", 25)
    ]
  };
}

function makeStepEasier(step: QuestStep): QuestStep {
  return {
    ...step,
    label: `${step.label} - easy`,
    instruction: `${step.instruction} Use half the target, wall/incline support, or slow walking if needed.`,
    targetReps: step.targetReps ? Math.max(3, Math.ceil(step.targetReps / 2)) : undefined,
    targetSeconds: step.targetSeconds
      ? Math.max(20, Math.ceil(step.targetSeconds / 2))
      : undefined
  };
}

function step(id: string, label: string, instruction: string, targetSeconds: number): QuestStep {
  return { id, label, instruction, targetSeconds };
}

function reps(id: string, label: string, instruction: string, targetReps: number): QuestStep {
  return { id, label, instruction, targetReps, restSeconds: 45 };
}
