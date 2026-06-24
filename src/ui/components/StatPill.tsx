import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

type StatPillProps = {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "violet" | "amber";
  onPress?: () => void;
};

export function StatPill({ label, value, tone = "cyan", onPress }: StatPillProps) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          styles[tone],
          pressed && styles.pressed
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.pill, styles[tone]]}>{content}</View>;
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 48,
    minWidth: 82,
    justifyContent: "center",
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  default: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt
  },
  cyan: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  violet: {
    borderColor: theme.colors.violet,
    backgroundColor: theme.colors.violetSoft
  },
  amber: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSoft
  },
  pressed: {
    opacity: 0.78
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800"
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "capitalize"
  }
});
