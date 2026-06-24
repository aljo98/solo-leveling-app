import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { PlayerStat } from "../src/core/quest/questTypes";
import { calculateLevel } from "../src/core/xp/xpEngine";
import { localStore } from "../src/storage/localStore";
import type { LocalSnapshot } from "../src/storage/storage";
import { lastNDays } from "../src/storage/storage";
import { Card } from "../src/ui/components/Card";
import { StatPill } from "../src/ui/components/StatPill";
import { theme } from "../src/ui/theme";

const statOrder: PlayerStat[] = [
  "strength",
  "endurance",
  "mobility",
  "recovery",
  "focus",
  "discipline",
  "mindset"
];

export default function ProgressScreen() {
  const [snapshot, setSnapshot] = useState<LocalSnapshot | null>(null);

  useEffect(() => {
    const load = async () => {
      setSnapshot(await localStore.loadSnapshot());
    };
    void load();
  }, []);

  const totalXp = useMemo(() => {
    if (!snapshot) return 0;
    return Object.values(snapshot.xpTotals).reduce((sum, value) => sum + value, 0);
  }, [snapshot]);

  if (!snapshot) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const level = calculateLevel(totalXp);
  const days14 = lastNDays(14);
  const comebackTotal = snapshot.questLogs.reduce(
    (sum, log) => sum + log.comebackBonus,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>PROGRESS</Text>
        <Text style={styles.title}>7 / 14 day signal</Text>

        <Card>
          <View style={styles.summaryGrid}>
            <StatPill label="Active 7" value={`${snapshot.activeDays7}/7`} />
            <StatPill label="Active 14" value={`${snapshot.activeDays14}/14`} />
            <StatPill label="Level" value={`${level.level}`} tone="violet" />
            <StatPill label="Comeback" value={`${comebackTotal} XP`} tone="amber" />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>XP by stat</Text>
          <View style={styles.statList}>
            {statOrder.map((stat) => {
              const value = snapshot.xpTotals[stat];
              const width: DimensionValue = `${Math.min(
                100,
                Math.round((value / 120) * 100)
              )}%`;
              return (
                <View key={stat} style={styles.statRow}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statName}>{stat}</Text>
                    <Text style={styles.statValue}>{value} XP</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>14-day log</Text>
          <View style={styles.dayGrid}>
            {days14.map((day) => {
              const logs = snapshot.questLogs.filter((log) => log.date === day);
              const active = logs.some(
                (log) => log.status === "completed" || log.status === "stopped_safely"
              );
              return (
                <View
                  key={day}
                  style={[styles.dayCell, active && styles.dayCellActive]}
                >
                  <Text style={styles.dayText}>{day.slice(5)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Completed quests</Text>
          {snapshot.questLogs.length ? (
            snapshot.questLogs.slice(0, 8).map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logTextWrap}>
                  <Text style={styles.logTitle}>{log.questTitle}</Text>
                  <Text style={styles.logMeta}>
                    {log.date} - {log.status.replaceAll("_", " ")}
                  </Text>
                </View>
                <Text style={styles.logXp}>{log.xpTotal} XP</Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>
              First quest log appears after a guided route.
            </Text>
          )}
        </Card>
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "800"
  },
  statList: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md
  },
  statRow: {
    gap: theme.spacing.xs
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  statName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize"
  },
  statValue: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  barTrack: {
    height: 9,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: theme.colors.surfaceAlt
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: theme.colors.primary
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  dayCell: {
    width: 64,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1
  },
  dayCellActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary
  },
  dayText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    paddingVertical: theme.spacing.md
  },
  logTextWrap: {
    flex: 1
  },
  logTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  logMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2
  },
  logXp: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm
  }
});
