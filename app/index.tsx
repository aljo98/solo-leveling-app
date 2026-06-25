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

import { determineDayMode } from "../src/core/readiness/dayMode";
import { buildReadinessSummary } from "../src/core/readiness/readinessEngine";
import { generateDailyQuest } from "../src/core/quest/questEngine";
import type { Equipment } from "../src/core/quest/questTypes";
import { calculateLevel } from "../src/core/xp/xpEngine";
import { localStore } from "../src/storage/localStore";
import type { LocalSnapshot, PlayerProfile } from "../src/storage/storage";
import { defaultBodyGoal, todayKey } from "../src/storage/storage";
import { Card } from "../src/ui/components/Card";
import { CheckInForm } from "../src/ui/components/CheckInForm";
import { PrimaryButton } from "../src/ui/components/PrimaryButton";
import { QuestCard } from "../src/ui/components/QuestCard";
import { StatPill } from "../src/ui/components/StatPill";
import { theme } from "../src/ui/theme";

const equipmentOptions: Equipment[] = [
  "none",
  "jump_rope",
  "resistance_band",
  "pullup_bar",
  "rings",
  "dumbbells"
];

export default function HomeScreen() {
  const [snapshot, setSnapshot] = useState<LocalSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const next = await localStore.loadSnapshot();
    setSnapshot(next);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const totalXp = useMemo(() => {
    if (!snapshot) return 0;
    return Object.values(snapshot.xpTotals).reduce((sum, value) => sum + value, 0);
  }, [snapshot]);

  if (loading || !snapshot) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading local system...</Text>
      </SafeAreaView>
    );
  }

  if (!snapshot.profile) {
    return <OnboardingScreen onSaved={reload} />;
  }

  const profile = snapshot.profile;
  const todayMode = snapshot.todayCheckIn
    ? determineDayMode(snapshot.todayCheckIn)
    : undefined;
  const readiness = snapshot.todayCheckIn
    ? buildReadinessSummary(snapshot.todayCheckIn)
    : undefined;
  const level = calculateLevel(totalXp);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>ASCEND SYSTEM</Text>
            <Text style={styles.title}>Today still counts</Text>
          </View>
          <StatPill label={`Lv ${level.level}`} value={`${totalXp} XP`} />
        </View>

        <Card>
          <View style={styles.playerRow}>
            <View>
              <Text style={styles.cardLabel}>Player</Text>
              <Text style={styles.cardTitle}>{profile.playerName}</Text>
            </View>
            <StatPill
              label="Body focus"
              value="Shoulders / arms"
              tone="violet"
            />
          </View>
          <Text style={styles.muted}>
            Main route: athletic base, endurance, posture, confidence.
          </Text>
        </Card>

        {snapshot.todayCheckIn ? (
          <Card tone={todayMode === "crisis" ? "warning" : "default"}>
            <Text style={styles.cardLabel}>Day mode</Text>
            <Text style={styles.cardTitle}>{readiness?.title}</Text>
            <Text style={styles.muted}>{readiness?.guidance}</Text>
            {todayMode === "crisis" ? (
              <View style={styles.supportBox}>
                <Text style={styles.supportTitle}>Local support route</Text>
                <Text style={styles.muted}>
                  This is not a diagnosis. Message a trusted person if that
                  would help right now. Try one grounding action, then decide
                  whether a minimum quest feels okay.
                </Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <CheckInForm
            onSubmit={async (checkIn) => {
              const quest = generateDailyQuest(
                checkIn,
                profile,
                snapshot.history
              );
              await localStore.saveDailyPlan(checkIn, quest);
              await reload();
            }}
          />
        )}

        {snapshot.todayQuest ? (
          <QuestCard
            quest={snapshot.todayQuest}
            onStart={() =>
              router.push({
                pathname: "/quest/[id]",
                params: { id: snapshot.todayQuest?.id ?? "" }
              })
            }
          />
        ) : null}

        <Card>
          <Text style={styles.cardLabel}>Progress pulse</Text>
          <Text style={styles.cardTitle}>
            {snapshot.activeDays7}/7 active days
          </Text>
          <Text style={styles.muted}>
            Minimum quests and safe stops keep the rhythm visible without
            pressure.
          </Text>
          <View style={styles.actions}>
            <PrimaryButton
              label="Assistant"
              variant="secondary"
              onPress={() => router.push("/assistant")}
            />
            <PrimaryButton
              label="Progress"
              variant="ghost"
              onPress={() => router.push("/progress")}
            />
            <PrimaryButton
              label="Journal"
              variant="ghost"
              onPress={() => router.push("/journal")}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function OnboardingScreen({ onSaved }: { onSaved: () => Promise<void> }) {
  const [playerName, setPlayerName] = useState("Aljaz");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([
    "none",
    "resistance_band"
  ]);
  const [constraints, setConstraints] = useState("");
  const [mentorTone, setMentorTone] = useState<PlayerProfile["mentorTone"]>(
    "steady_coach"
  );

  const toggleEquipment = (equipment: Equipment) => {
    setSelectedEquipment((current) => {
      if (equipment === "none") return ["none"];
      const withoutNone = current.filter((item) => item !== "none");
      if (withoutNone.includes(equipment)) {
        const next = withoutNone.filter((item) => item !== equipment);
        return next.length ? next : ["none"];
      }
      return [...withoutNone, equipment];
    });
  };

  const save = async () => {
    const profile: PlayerProfile = {
      id: "local-player",
      playerName: playerName.trim() || "Player",
      goal: {
        ...defaultBodyGoal,
        constraints: constraints
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        equipment: selectedEquipment
      },
      mentorTone,
      createdAt: new Date().toISOString()
    };

    await localStore.saveProfile(profile);
    await onSaved();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>LOCAL MVP</Text>
        <Text style={styles.title}>Set your 14-day route</Text>

        <Card>
          <Text style={styles.cardLabel}>Player name</Text>
          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Player"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Body goal</Text>
          <Text style={styles.cardTitle}>Shoulders, arms, athletic base</Text>
          <Text style={styles.muted}>Secondary: endurance, posture, confidence.</Text>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Equipment</Text>
          <View style={styles.chipGrid}>
            {equipmentOptions.map((equipment) => (
              <Pressable
                key={equipment}
                onPress={() => toggleEquipment(equipment)}
                style={[
                  styles.chip,
                  selectedEquipment.includes(equipment) && styles.chipActive
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedEquipment.includes(equipment) && styles.chipTextActive
                  ]}
                >
                  {equipment.replaceAll("_", " ")}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Constraints</Text>
          <TextInput
            value={constraints}
            onChangeText={setConstraints}
            placeholder="Optional, comma separated"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.multiInput]}
            multiline
          />
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Mentor tone</Text>
          <View style={styles.chipGrid}>
            {(["steady_coach", "direct_system", "quiet_rival"] as const).map(
              (tone) => (
                <Pressable
                  key={tone}
                  onPress={() => setMentorTone(tone)}
                  style={[styles.chip, mentorTone === tone && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      mentorTone === tone && styles.chipTextActive
                    ]}
                  >
                    {tone.replaceAll("_", " ")}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </Card>

        <PrimaryButton label="Start local system" onPress={save} />
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
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md
  },
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  loadingText: {
    color: theme.colors.textMuted
  },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  cardLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    marginTop: theme.spacing.xs
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm
  },
  supportBox: {
    borderColor: theme.colors.warning,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md
  },
  supportTitle: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  input: {
    minHeight: 52,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 17,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  multiInput: {
    minHeight: 84,
    textAlignVertical: "top"
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  chip: {
    minHeight: 44,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md
  },
  chipActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  chipTextActive: {
    color: theme.colors.text
  }
});
