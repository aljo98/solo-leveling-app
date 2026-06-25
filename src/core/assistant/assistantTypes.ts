import type { Quest } from "../quest/questTypes";

export type AssistantRole = "user" | "assistant" | "system";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text: string;
  createdAt: string;
};

export type AssistantSettings = {
  aiBackendUrl?: string;
  minimaxSpeechProxyUrl?: string;
  minimaxApiKey?: string;
  minimaxGroupId?: string;
  minimaxModel?: string;
  minimaxVoiceId?: string;
  speechEnabled: boolean;
};

export type AssistantContext = {
  playerName?: string;
  todayQuest?: Quest;
  activeDays7: number;
  activeDays14: number;
  totalXp: number;
};

export type AssistantReply = {
  message: AssistantMessage;
  suggestedQuest?: Quest;
};

export const defaultAssistantSettings: AssistantSettings = {
  speechEnabled: true,
  minimaxModel: "speech-02-hd",
  minimaxVoiceId: "male-qn-qingse"
};
