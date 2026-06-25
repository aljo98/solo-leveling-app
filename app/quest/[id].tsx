import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Quest, QuestStep } from "../../src/core/quest/questTypes";
import { getSafetyStopCopy } from "../../src/core/safety/safetyRules";
import { calculateXp } from "../../src/core/xp/xpEngine";
import { localStore } from "../../src/storage/localStore";
import type { LocalSnapshot, QuestLogRecord } from "../../src/storage/storage";
import { todayKey } from "../../src/storage/storage";
import { Card } from "../../src/ui/components/Card";
import { PrimaryButton } from "../../src/ui/components/PrimaryButton";
import { WorkoutStepCard } from "../../src/ui/components/WorkoutStepCard";
import { theme } from "../../src/ui/theme";

export default function QuestHudScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [snapshot, setSnapshot] = useState<LocalSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [easierVisible, setEasierVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [loadedQuest, loadedSnapshot] = await Promise.all([
        localStore.getQuestById(id),
        localStore.loadSnapshot()
      ]);
      setQuest(loadedQuest);
      setSnapshot(loadedSnapshot);
      setLoading(false);
    };
    void load();
  }, [id]);

  const currentStep = quest?.steps[currentIndex];
  const progressLabel = useMemo(() => {
    if (!quest) return "";
    return `${Math.min(currentIndex + 1, quest.steps.length)} / ${quest.steps.length}`;
  }, [currentIndex, quest]);

  const finishQuest = async (
    status: QuestLogRecord["status"],
    finalCompletedIds = completedStepIds
  ) => {
    if (!quest || !snapshot || saving) return;
    setSaving(true);
    const xp = calculateXp({
      quest,
      status,
      history: snapshot.history,
      date: todayKey(),
      completedStepCount: finalCompletedIds.length
    });
    const log: QuestLogRecord = {
      id: `${quest.id}-${status}-${Date.now()}`,
      questId: quest.id,
      questTitle: quest.title,
      category: quest.category,
      dayMode: quest.dayMode,
      date: todayKey(),
      status,
      completedStepIds: finalCompletedIds,
      xpTotal: xp.total,
      xpByStat: xp.byStat,
      comebackBonus: xp.comebackBonus,
      createdAt: new Date().toISOString()
    };

    await localStore.saveQuestLog(log);
    await localStore.addXp(xp.byStat);
    router.replace({
      pathname: "/journal",
      params: { questId: quest.id, status }
    });
  };

  const markStepDone = async (step: QuestStep) => {
    const nextCompleted = completedStepIds.includes(step.id)
      ? completedStepIds
      : [...completedStepIds, step.id];
    setCompletedStepIds(nextCompleted);

    if (!quest) return;
    if (currentIndex >= quest.steps.length - 1) {
      await finishQuest("completed", nextCompleted);
      return;
    }
    setCurrentIndex((value) => value + 1);
    setEasierVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!quest || !currentStep) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.title}>Quest not found</Text>
            <Text style={styles.muted}>Return to rhythm from the daily screen.</Text>
            <PrimaryButton label="Go home" onPress={() => router.replace("/")} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.kicker}>{quest.dayMode.toUpperCase()} ROUTE</Text>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.muted}>{quest.reason}</Text>
          <Text style={styles.progress}>{progressLabel}</Text>
        </Card>

        <WorkoutStepCard
          step={currentStep}
          completed={completedStepIds.includes(currentStep.id)}
        />

        {paused ? (
          <Card tone="warning">
            <Text style={styles.cardTitle}>Quest paused</Text>
            <Text style={styles.muted}>
              No pressure. Take water, breathe once, then choose the next tiny
              step.
            </Text>
            <PrimaryButton label="Resume" onPress={() => setPaused(false)} />
          </Card>
        ) : null}

        {easierVisible ? (
          <Card>
            <Text style={styles.cardTitle}>Easier version</Text>
            <Text style={styles.muted}>
              Cut the target in half, use a wall or incline variation, or
              switch this step to slow walking. The route still counts.
            </Text>
          </Card>
        ) : null}

        <View style={styles.buttonStack}>
          <PrimaryButton
            label="Ask assistant"
            variant="secondary"
            disabled={saving}
            onPress={() => router.push("/assistant")}
          />
          <PrimaryButton
            label={saving ? "Saving..." : "Done"}
            disabled={saving || paused}
            onPress={() => markStepDone(currentStep)}
          />
          <PrimaryButton
            label="Too hard -> easier version"
            variant="secondary"
            disabled={saving}
            onPress={() => setEasierVisible((value) => !value)}
          />
          <PrimaryButton
            label={paused ? "Resume" : "Pause"}
            variant="ghost"
            disabled={saving}
            onPress={() => setPaused((value) => !value)}
          />
          <PrimaryButton
            label="Stop safely"
            variant="danger"
            disabled={saving}
            onPress={() => finishQuest("stopped_safely")}
          />
        </View>

        <Text style={styles.stopCopy}>{getSafetyStopCopy(quest.dayMode)}</Text>
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
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    marginTop: theme.spacing.xs
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm
  },
  progress: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: theme.spacing.md
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  buttonStack: {
    gap: theme.spacing.sm
  },
  stopCopy: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center"
  }
});
