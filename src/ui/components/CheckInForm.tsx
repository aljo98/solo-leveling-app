import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { CheckIn, Rating } from "../../core/quest/questTypes";
import { todayKey } from "../../storage/storage";
import { theme } from "../theme";
import { Card } from "./Card";
import { PrimaryButton } from "./PrimaryButton";

type CheckInFormProps = {
  onSubmit: (checkIn: CheckIn) => Promise<void>;
};

const ratings: Rating[] = [1, 2, 3, 4, 5];
const timeOptions: CheckIn["timeAvailableMin"][] = [5, 10, 20, 40];

export function CheckInForm({ onSubmit }: CheckInFormProps) {
  const [energy, setEnergy] = useState<Rating>(3);
  const [mood, setMood] = useState<Rating>(3);
  const [focus, setFocus] = useState<Rating>(3);
  const [stress, setStress] = useState<Rating>(3);
  const [bodyPain, setBodyPain] = useState(false);
  const [timeAvailableMin, setTimeAvailableMin] =
    useState<CheckIn["timeAvailableMin"]>(20);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await onSubmit({
      date: todayKey(),
      energy,
      mood,
      focus,
      stress,
      bodyPain,
      timeAvailableMin,
      note: note.trim() || undefined
    });
    setSaving(false);
  };

  return (
    <Card>
      <Text style={styles.label}>Daily check-in</Text>
      <Text style={styles.title}>Choose today&apos;s signal</Text>
      <RatingRow label="Energy" value={energy} onChange={setEnergy} />
      <RatingRow label="Mood" value={mood} onChange={setMood} />
      <RatingRow label="Focus" value={focus} onChange={setFocus} />
      <RatingRow label="Stress" value={stress} onChange={setStress} />

      <View style={styles.block}>
        <Text style={styles.rowLabel}>Body pain</Text>
        <View style={styles.row}>
          <ChoiceChip label="No" active={!bodyPain} onPress={() => setBodyPain(false)} />
          <ChoiceChip label="Yes" active={bodyPain} onPress={() => setBodyPain(true)} />
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.rowLabel}>Time available</Text>
        <View style={styles.row}>
          {timeOptions.map((time) => (
            <ChoiceChip
              key={time}
              label={`${time}m`}
              active={timeAvailableMin === time}
              onPress={() => setTimeAvailableMin(time)}
            />
          ))}
        </View>
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Optional note"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        multiline
      />

      <PrimaryButton
        label={saving ? "Saving..." : "Generate quest"}
        disabled={saving}
        onPress={submit}
      />
    </Card>
  );
}

function RatingRow({
  label,
  value,
  onChange
}: {
  label: string;
  value: Rating;
  onChange: (value: Rating) => void;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.row}>
        {ratings.map((rating) => (
          <ChoiceChip
            key={rating}
            label={`${rating}`}
            active={value === rating}
            onPress={() => onChange(rating)}
          />
        ))}
      </View>
    </View>
  );
}

function ChoiceChip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
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
    fontSize: 22,
    fontWeight: "900",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs
  },
  block: {
    marginBottom: theme.spacing.md
  },
  rowLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: theme.spacing.sm
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  chip: {
    minHeight: 44,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md
  },
  chipActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary
  },
  pressed: {
    opacity: 0.78
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: "800"
  },
  chipTextActive: {
    color: theme.colors.text
  },
  input: {
    minHeight: 82,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    textAlignVertical: "top"
  }
});
