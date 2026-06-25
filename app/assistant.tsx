import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { generateAssistantReply } from "../src/core/assistant/assistantEngine";
import type {
  AssistantMessage,
  AssistantSettings
} from "../src/core/assistant/assistantTypes";
import { defaultAssistantSettings } from "../src/core/assistant/assistantTypes";
import type { Quest } from "../src/core/quest/questTypes";
import { localStore } from "../src/storage/localStore";
import type { LocalSnapshot } from "../src/storage/storage";
import { speakAssistantText, stopAssistantSpeech } from "../src/services/speech/speechService";
import { Card } from "../src/ui/components/Card";
import { PrimaryButton } from "../src/ui/components/PrimaryButton";
import { QuestCard } from "../src/ui/components/QuestCard";
import { StatPill } from "../src/ui/components/StatPill";
import { theme } from "../src/ui/theme";

const quickPrompts = [
  "Preglej današnji quest",
  "Naredi lažje",
  "Ustvari 10 min mobility",
  "Ustvari cardio"
];

export default function AssistantScreen() {
  const [snapshot, setSnapshot] = useState<LocalSnapshot | null>(null);
  const [settings, setSettings] = useState<AssistantSettings>(
    defaultAssistantSettings
  );
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [suggestedQuest, setSuggestedQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const reload = async () => {
    const next = await localStore.loadSnapshot();
    setSnapshot(next);
    setSettings(next.assistantSettings);
    setMessages(next.assistantMessages);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const context = useMemo(() => {
    const totalXp = snapshot
      ? Object.values(snapshot.xpTotals).reduce((sum, value) => sum + value, 0)
      : 0;
    return {
      playerName: snapshot?.profile?.playerName,
      todayQuest: snapshot?.todayQuest,
      activeDays7: snapshot?.activeDays7 ?? 0,
      activeDays14: snapshot?.activeDays14 ?? 0,
      totalXp
    };
  }, [snapshot]);

  const saveSettings = async (nextSettings: AssistantSettings) => {
    setSettings(nextSettings);
    await localStore.saveAssistantSettings(nextSettings);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString()
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    await localStore.saveAssistantMessage(userMessage);

    const reply = await generateAssistantReply({
      text: trimmed,
      context,
      settings,
      history: nextMessages
    });

    setMessages((current) => [...current, reply.message]);
    setSuggestedQuest(reply.suggestedQuest ?? null);
    await localStore.saveAssistantMessage(reply.message);
    await speakAssistantText(reply.message.text, settings);
    setSending(false);
  };

  const applySuggestedQuest = async () => {
    if (!suggestedQuest || !snapshot?.todayCheckIn) return;
    await localStore.saveDailyPlan(snapshot.todayCheckIn, suggestedQuest);
    await reload();
    router.replace("/");
  };

  if (loading || !snapshot) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>AI ASSISTANT</Text>
        <Text style={styles.title}>Quest coach</Text>

        <Card>
          <Text style={styles.cardTitle}>Assist mode</Text>
          <Text style={styles.muted}>
            Chat uporablja konfiguriran AI backend, če obstaja. Brez backend URL-ja
            deluje lokalni coach za pregled, prilagoditev in ustvarjanje vaj.
          </Text>
          <View style={styles.pillRow}>
            <StatPill label="7 days" value={`${snapshot.activeDays7}/7`} />
            <StatPill label="14 days" value={`${snapshot.activeDays14}/14`} />
            <StatPill
              label="Speech"
              value={settings.speechEnabled ? "On" : "Off"}
              tone={settings.speechEnabled ? "cyan" : "default"}
              onPress={() =>
                saveSettings({
                  ...settings,
                  speechEnabled: !settings.speechEnabled
                })
              }
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Backend settings</Text>
          <Text style={styles.fieldLabel}>AI backend URL</Text>
          <TextInput
            value={settings.aiBackendUrl ?? ""}
            onChangeText={(value) =>
              setSettings((current) => ({ ...current, aiBackendUrl: value }))
            }
            onBlur={() => localStore.saveAssistantSettings(settings)}
            placeholder="https://your-domain.com/api/assistant"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
          />
          <Text style={styles.fieldLabel}>Minimax speech proxy URL</Text>
          <TextInput
            value={settings.minimaxSpeechProxyUrl ?? ""}
            onChangeText={(value) =>
              setSettings((current) => ({
                ...current,
                minimaxSpeechProxyUrl: value
              }))
            }
            onBlur={() => localStore.saveAssistantSettings(settings)}
            placeholder="https://your-domain.com/api/minimax/tts"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
          />
          <Text style={styles.fieldLabel}>Voice id</Text>
          <TextInput
            value={settings.minimaxVoiceId ?? ""}
            onChangeText={(value) =>
              setSettings((current) => ({ ...current, minimaxVoiceId: value }))
            }
            onBlur={() => localStore.saveAssistantSettings(settings)}
            placeholder="male-qn-qingse"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <View style={styles.quickGrid}>
            {quickPrompts.map((prompt) => (
              <Pressable
                key={prompt}
                style={styles.quickButton}
                onPress={() => sendMessage(prompt)}
                disabled={sending}
              >
                <Text style={styles.quickText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Chat</Text>
          <View style={styles.messages}>
            {messages.length ? (
              messages.slice(-12).map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.message,
                    message.role === "user" ? styles.userMessage : styles.assistantMessage
                  ]}
                >
                  <Text style={styles.messageRole}>{message.role}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                  {message.role === "assistant" ? (
                    <PrimaryButton
                      label="Speak"
                      variant="ghost"
                      onPress={() => speakAssistantText(message.text, settings)}
                    />
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.muted}>
                Začni z vprašanjem ali uporabi quick action. Primer: "ustvari 10
                min mobility".
              </Text>
            )}
          </View>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask for review, adaptation, or new exercise..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.chatInput]}
            multiline
          />
          <View style={styles.actions}>
            <PrimaryButton
              label={sending ? "Thinking..." : "Send"}
              disabled={sending}
              onPress={() => sendMessage(input)}
            />
            <PrimaryButton
              label="Stop speech"
              variant="ghost"
              onPress={stopAssistantSpeech}
            />
          </View>
        </Card>

        {suggestedQuest ? (
          <View style={styles.suggested}>
            <QuestCard quest={suggestedQuest} onStart={applySuggestedQuest} />
            <Text style={styles.applyNote}>
              Gumb shrani ta predlog kot današnji quest in te vrne na Daily
              System.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background
  },
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  fieldLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: theme.spacing.md
  },
  input: {
    minHeight: 50,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 15,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  chatInput: {
    minHeight: 82,
    textAlignVertical: "top"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  quickButton: {
    minHeight: 46,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primarySoft
  },
  quickText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  messages: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  message: {
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  userMessage: {
    borderColor: theme.colors.violet,
    backgroundColor: theme.colors.violetSoft
  },
  assistantMessage: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt
  },
  messageRole: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  suggested: {
    gap: theme.spacing.sm
  },
  applyNote: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center"
  }
});
