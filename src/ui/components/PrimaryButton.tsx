import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false
}: PrimaryButtonProps) {
  const handlePress = () => {
    if (disabled) return;
    void Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.violet
  },
  ghost: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.danger,
    borderWidth: 1
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    opacity: 0.78
  },
  label: {
    color: "#031018",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  ghostLabel: {
    color: theme.colors.text
  }
});
