import { StyleSheet, Text, View } from "react-native";

import type { QuestStep } from "../../core/quest/questTypes";
import { theme } from "../theme";
import { Card } from "./Card";
import { StatPill } from "./StatPill";

type WorkoutStepCardProps = {
  step: QuestStep;
  completed?: boolean;
};

export function WorkoutStepCard({ step, completed = false }: WorkoutStepCardProps) {
  return (
    <Card>
      <Text style={styles.label}>Current step</Text>
      <Text style={styles.title}>{step.label}</Text>
      <Text style={styles.instruction}>{step.instruction}</Text>
      <View style={styles.row}>
        {step.targetReps ? (
          <StatPill label="Target" value={`${step.targetReps} reps`} />
        ) : null}
        {step.targetSeconds ? (
          <StatPill label="Timer" value={`${step.targetSeconds}s`} />
        ) : null}
        {step.restSeconds ? (
          <StatPill label="Rest" value={`${step.restSeconds}s`} tone="violet" />
        ) : null}
        <StatPill
          label="State"
          value={completed ? "Done" : "Ready"}
          tone={completed ? "cyan" : "default"}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    marginTop: theme.spacing.xs
  },
  instruction: {
    color: theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: theme.spacing.md
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg
  }
});
