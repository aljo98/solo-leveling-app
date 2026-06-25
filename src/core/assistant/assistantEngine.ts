import type { Quest } from "../quest/questTypes";
import type {
  AssistantContext,
  AssistantMessage,
  AssistantReply,
  AssistantSettings
} from "./assistantTypes";
import {
  adaptQuestDifficulty,
  createCustomExerciseQuest,
  reviewQuestForToday
} from "./exerciseCoach";

export async function generateAssistantReply(input: {
  text: string;
  context: AssistantContext;
  settings: AssistantSettings;
  history: AssistantMessage[];
}): Promise<AssistantReply> {
  const backendReply = await tryRemoteAssistant(input);
  if (backendReply) return backendReply;

  return generateLocalAssistantReply(input.text, input.context);
}

export function generateLocalAssistantReply(
  text: string,
  context: AssistantContext
): AssistantReply {
  const lower = text.toLowerCase();

  if (
    lower.includes("pregled") ||
    lower.includes("preglej") ||
    lower.includes("review") ||
    lower.includes("preveri")
  ) {
    return assistant(reviewQuestForToday(context));
  }

  if (lower.includes("laž") || lower.includes("laz") || lower.includes("easy") || lower.includes("težko")) {
    if (!context.todayQuest) {
      return assistant("Ni današnjega questa za prilagoditev. Naredi check-in ali napiši kakšno vajo želiš ustvariti.");
    }
    const suggestedQuest = adaptQuestDifficulty(context.todayQuest, "easier");
    return assistant(
      `Pripravil sem lažjo verzijo: ${suggestedQuest.title}. Če jo uporabiš, zmanjša cilje in ohrani današnji ritem.`,
      suggestedQuest
    );
  }

  if (lower.includes("težje") || lower.includes("tezje") || lower.includes("harder") || lower.includes("plus")) {
    if (!context.todayQuest) {
      return assistant("Ni današnjega questa za progresijo. Najprej naredi check-in.");
    }
    const suggestedQuest = adaptQuestDifficulty(context.todayQuest, "harder");
    return assistant(
      `Pripravil sem prilagojeno verzijo: ${suggestedQuest.title}. Uporabi jo samo, če forma ostane čista.`,
      suggestedQuest
    );
  }

  if (lower.includes("ustvari") || lower.includes("create") || lower.includes("nova vaja") || lower.includes("trening")) {
    const suggestedQuest = createCustomExerciseQuest(context, text);
    return assistant(
      `Ustvaril sem predlog: ${suggestedQuest.title}. Trajanje ${suggestedQuest.durationMin} min, ${suggestedQuest.steps.length} koraki.`,
      suggestedQuest
    );
  }

  const questLine = context.todayQuest
    ? `Današnji quest je ${context.todayQuest.title}.`
    : "Današnji quest še ni izbran.";
  return assistant(
    `${questLine} Lahko napišeš: "preglej quest", "naredi lažje", "ustvari 10 min mobility" ali "ustvari cardio".`
  );
}

async function tryRemoteAssistant(input: {
  text: string;
  context: AssistantContext;
  settings: AssistantSettings;
  history: AssistantMessage[];
}): Promise<AssistantReply | null> {
  const url = input.settings.aiBackendUrl?.trim();
  if (!url) return null;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input.text,
        context: input.context,
        history: input.history.slice(-12)
      })
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      text?: string;
      suggestedQuest?: Quest;
    };
    if (!data.text) return null;

    return assistant(data.text, data.suggestedQuest);
  } catch {
    return null;
  }
}

function assistant(text: string, suggestedQuest?: Quest): AssistantReply {
  return {
    message: {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text,
      createdAt: new Date().toISOString()
    },
    suggestedQuest
  };
}
