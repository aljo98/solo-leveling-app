import { createAudioPlayer } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

import type { AssistantSettings } from "../../core/assistant/assistantTypes";

type MinimaxProxyResponse = {
  audioBase64?: string;
  audioUrl?: string;
  mimeType?: string;
};

let activePlayer: AudioPlayer | null = null;

export async function speakAssistantText(
  text: string,
  settings: AssistantSettings
) {
  if (!settings.speechEnabled) return;

  const minimaxUrl = settings.minimaxSpeechProxyUrl?.trim();
  if (minimaxUrl) {
    const played = await tryMinimaxProxy(text, minimaxUrl, settings.minimaxVoiceId);
    if (played) return;
  }

  Speech.stop();
  Speech.speak(text, {
    language: "sl-SI",
    pitch: 1,
    rate: 0.92
  });
}

export function stopAssistantSpeech() {
  Speech.stop();
  if (activePlayer) {
    activePlayer.pause();
    activePlayer.remove();
    activePlayer = null;
  }
}

async function tryMinimaxProxy(
  text: string,
  url: string,
  voiceId?: string
) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voiceId
      })
    });
    if (!response.ok) return false;

    const data = (await response.json()) as MinimaxProxyResponse;
    const sourceUri = data.audioUrl
      ? data.audioUrl
      : data.audioBase64
        ? `data:${data.mimeType ?? "audio/mpeg"};base64,${data.audioBase64}`
        : undefined;

    if (!sourceUri) return false;

    if (activePlayer) {
      activePlayer.pause();
      activePlayer.remove();
    }
    activePlayer = createAudioPlayer(sourceUri);
    activePlayer.play();
    return true;
  } catch {
    return false;
  }
}
