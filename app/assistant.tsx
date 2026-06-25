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
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
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

  const updateSettings = (patch: Partial<AssistantSettings>) => {
    setSettings((current) => {
      const nextSettings = { ...current, ...patch };
      void localStore.saveAssistantSettings(nextSettings);
      return nextSettings;
    });
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

        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === "chat" ? styles.activeTab : null]}
            onPress={() => setActiveTab("chat")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "chat" ? styles.activeTabText : null
              ]}
            >
              Chat
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "settings" ? styles.activeTab : null]}
            onPress={() => setActiveTab("settings")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "settings" ? styles.activeTabText : null
              ]}
            >
              Nastavitve
            </Text>
          </Pressable>
        </View>

        {activeTab === "chat" ? (
          <>
            <Card>
              <Text style={styles.cardTitle}>Chat</Text>
              <View style={styles.pillRow}>
                <StatPill label="7 days" value={`${snapshot.activeDays7}/7`} />
                <StatPill label="14 days" value={`${snapshot.activeDays14}/14`} />
                <StatPill
                  label="Speech"
                  value={settings.speechEnabled ? "On" : "Off"}
                  tone={settings.speechEnabled ? "cyan" : "default"}
                  onPress={() =>
                    updateSettings({ speechEnabled: !settings.speechEnabled })
                  }
                />
              </View>
              <View style={styles.messages}>
                {messages.length ? (
                  messages.slice(-12).map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.message,
                        message.role === "user"
                          ? styles.userMessage
                          : styles.assistantMessage
                      ]}
                    >
                      <Text style={styles.messageRole}>
                        {message.role === "user" ? "You" : "Assistant"}
                      </Text>
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
                  <View style={[styles.message, styles.assistantMessage]}>
                    <Text style={styles.messageRole}>Assistant</Text>
                    <Text style={styles.messageText}>
                      Napiši, kaj rabiš: pregled questa, lažjo verzijo, težjo
                      verzijo ali novo vajo. Lokalni coach deluje takoj, AI
                      backend in Minimax govor nastaviš v zavihku Nastavitve.
                    </Text>
                  </View>
                )}
              </View>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Vprašaj za pregled, prilagoditev ali novo vajo..."
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
          </>
        ) : (
          <>
            <Card>
              <Text style={styles.cardTitle}>Nastavitve asistenta</Text>
              <Text style={styles.fieldLabel}>AI backend URL</Text>
              <TextInput
                value={settings.aiBackendUrl ?? ""}
                onChangeText={(value) => updateSettings({ aiBackendUrl: value })}
                placeholder="https://your-domain.com/api/assistant"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.fieldHint}>
                Opcijsko. Če je prazno, chat uporablja lokalnega coacha.
              </Text>
            </Card>

            <Card>
              <Text style={styles.cardTitle}>Minimax govor</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Speech</Text>
                <StatPill
                  label="Mode"
                  value={settings.speechEnabled ? "On" : "Off"}
                  tone={settings.speechEnabled ? "cyan" : "default"}
                  onPress={() =>
                    updateSettings({ speechEnabled: !settings.speechEnabled })
                  }
                />
              </View>

              <Text style={styles.fieldLabel}>Minimax API key</Text>
              <TextInput
                value={settings.minimaxApiKey ?? ""}
                onChangeText={(value) => updateSettings({ minimaxApiKey: value })}
                placeholder="Bearer key"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
                secureTextEntry
              />
              <Text style={styles.fieldLabel}>Minimax Group ID</Text>
              <TextInput
                value={settings.minimaxGroupId ?? ""}
                onChangeText={(value) => updateSettings({ minimaxGroupId: value })}
                placeholder="GroupId iz Minimax konzole"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Model</Text>
              <TextInput
                value={settings.minimaxModel ?? ""}
                onChangeText={(value) => updateSettings({ minimaxModel: value })}
                placeholder="speech-02-hd"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Voice ID</Text>
              <TextInput
                value={settings.minimaxVoiceId ?? ""}
                onChangeText={(value) => updateSettings({ minimaxVoiceId: value })}
                placeholder="male-qn-qingse"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Proxy URL</Text>
              <TextInput
                value={settings.minimaxSpeechProxyUrl ?? ""}
                onChangeText={(value) =>
                  updateSettings({ minimaxSpeechProxyUrl: value })
                }
                placeholder="https://your-domain.com/api/minimax/tts"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.fieldHint}>
                Proxy je priporočljiv za produkcijo. Neposreden API key je
                shranjen lokalno v aplikaciji na napravi.
              </Text>
              <View style={styles.actions}>
                <PrimaryButton
                  label="Test Minimax speech"
                  onPress={() =>
                    speakAssistantText(
                      "Minimax speech test. Quest coach is ready.",
                      settings
                    )
                  }
                />
                <PrimaryButton
                  label="Stop speech"
                  variant="ghost"
                  onPress={stopAssistantSpeech}
                />
              </View>
            </Card>
          </>
        )}

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
  tabBar: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    padding: 4
  },
  tab: {
    alignItems: "center",
    borderRadius: theme.radii.sm,
    flex: 1,
    minHeight: 48,
    justifyContent: "center"
  },
  activeTab: {
    backgroundColor: theme.colors.primary
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: "900"
  },
  activeTabText: {
    color: theme.colors.background
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
  fieldHint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.spacing.sm
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
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800"
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
