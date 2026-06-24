import { StyleSheet, Text, View } from "react-native";

import type { Quest } from "../../core/quest/questTypes";
import { theme } from "../theme";
import { Card } from "./Card";
import { PrimaryButton } from "./PrimaryButton";
import { StatPill } from "./StatPill";

type QuestCardProps = {
  quest: Quest;
  onStart: () => void;
};

export function QuestCard({ quest, onStart }: QuestCardProps) {
  return (
    <Card>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.label}>Main quest</Text>
          <Text style={styles.title}>{quest.title}</Text>
        </View>
        <StatPill label={quest.category} value={`${quest.durationMin} min`} />
      </View>
      <Text style={styles.reason}>{quest.reason}</Text>
      <View style={styles.metaRow}>
        <StatPill label="Reward" value={`${quest.xpReward} XP`} tone="violet" />
        <StatPill label="Steps" value={`${quest.steps.length}`} tone="default" />
      </View>
      <PrimaryButton label="Start guided quest" onPress={onStart} />
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  titleWrap: {
    flex: 1
  },
  label: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  title: {
    color: theme.colors.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    marginTop: theme.spacing.xs
  },
  reason: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.md
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md
  }
});
