import { createAudioPlayer } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

import type { AssistantSettings } from "../../core/assistant/assistantTypes";

type MinimaxProxyResponse = {
  audioBase64?: string;
  audioUrl?: string;
  mimeType?: string;
};

type MinimaxDirectResponse = {
  data?: {
    audio?: string;
    audio_file?: string;
    audioUrl?: string;
    audio_url?: string;
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
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

  const directPlayed = await tryMinimaxDirect(text, settings);
  if (directPlayed) return;

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

async function tryMinimaxDirect(text: string, settings: AssistantSettings) {
  const apiKey = settings.minimaxApiKey?.trim();
  const groupId = settings.minimaxGroupId?.trim();
  if (!apiKey || !groupId) return false;

  try {
    const response = await fetch(
      `https://api.minimax.chat/v1/t2a_v2?GroupId=${encodeURIComponent(groupId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: settings.minimaxModel?.trim() || "speech-02-hd",
          text,
          stream: false,
          voice_setting: {
            voice_id: settings.minimaxVoiceId?.trim() || "male-qn-qingse",
            speed: 1,
            vol: 1,
            pitch: 0
          },
          audio_setting: {
            sample_rate: 32000,
            bitrate: 128000,
            format: "mp3",
            channel: 1
          }
        })
      }
    );
    if (!response.ok) return false;

    const data = (await response.json()) as MinimaxDirectResponse;
    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      return false;
    }

    const audioUrl = data.data?.audioUrl ?? data.data?.audio_url;
    const audioHex = data.data?.audio ?? data.data?.audio_file;
    const sourceUri = audioUrl
      ? audioUrl
      : audioHex
        ? `data:audio/mpeg;base64,${hexToBase64(audioHex)}`
        : undefined;

    if (!sourceUri) return false;

    playAudioSource(sourceUri);
    return true;
  } catch {
    return false;
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

    playAudioSource(sourceUri);
    return true;
  } catch {
    return false;
  }
}

function playAudioSource(sourceUri: string) {
  if (activePlayer) {
    activePlayer.pause();
    activePlayer.remove();
  }
  activePlayer = createAudioPlayer(sourceUri);
  activePlayer.play();
}

function hexToBase64(hex: string) {
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let index = 0;

  while (index < clean.length) {
    const byte1 = parseInt(clean.slice(index, index + 2), 16);
    const byte2 =
      index + 2 < clean.length ? parseInt(clean.slice(index + 2, index + 4), 16) : NaN;
    const byte3 =
      index + 4 < clean.length ? parseInt(clean.slice(index + 4, index + 6), 16) : NaN;

    output += alphabet[byte1 >> 2];
    output += alphabet[((byte1 & 3) << 4) | (Number.isNaN(byte2) ? 0 : byte2 >> 4)];
    output += Number.isNaN(byte2)
      ? "="
      : alphabet[((byte2 & 15) << 2) | (Number.isNaN(byte3) ? 0 : byte3 >> 6)];
    output += Number.isNaN(byte3) ? "=" : alphabet[byte3 & 63];
    index += 6;
  }

  return output;
}
