import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../theme";

type CardProps = PropsWithChildren<{
  tone?: "default" | "warning";
}>;

export function Card({ children, tone = "default" }: CardProps) {
  return <View style={[styles.card, tone === "warning" && styles.warning]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg
  },
  warning: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSoft
  }
});
