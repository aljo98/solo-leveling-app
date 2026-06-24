import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { localStore } from "../src/storage/localStore";
import type { JournalReflection } from "../src/storage/storage";
import { todayKey } from "../src/storage/storage";
import { Card } from "../src/ui/components/Card";
import { PrimaryButton } from "../src/ui/components/PrimaryButton";
import { StatPill } from "../src/ui/components/StatPill";
import { theme } from "../src/ui/theme";

const ratingValues = [1, 2, 3, 4, 5] as const;

export default function JournalScreen() {
  const { questId, status } = useLocalSearchParams<{
    questId?: string;
    status?: JournalReflection["questStatus"];
  }>();
  const [effort, setEffort] = useState<JournalReflection["effort"]>(3);
  const [moodAfter, setMoodAfter] = useState<JournalReflection["moodAfter"]>(3);
  const [painAfter, setPainAfter] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const saveReflection = async (skipNote: boolean) => {
    setSaving(true);
    const reflection: JournalReflection = {
      id: `${questId ?? "free"}-${Date.now()}`,
      questId,
      questStatus: status,
      date: todayKey(),
      effort,
      moodAfter,
      painAfter,
      note: skipNote ? undefined : note.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    await localStore.saveJournalReflection(reflection);
    router.replace("/progress");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>REFLECTION</Text>
        <Text style={styles.title}>Close the loop</Text>

        {status ? (
          <Card>
            <Text style={styles.cardLabel}>Quest state</Text>
            <Text style={styles.cardTitle}>{status.replaceAll("_", " ")}</Text>
            <Text style={styles.muted}>
              Save a short signal for tomorrow. A skipped note is still a clean
              finish.
            </Text>
          </Card>
        ) : null}

        <RatingCard label="Effort" value={effort} onChange={setEffort} />
        <RatingCard
          label="Mood after"
          value={moodAfter}
          onChange={setMoodAfter}
        />

        <Card>
          <Text style={styles.cardLabel}>Pain after</Text>
          <View style={styles.row}>
            <StatPill
              label="No"
              value={painAfter ? "Off" : "Selected"}
              tone={!painAfter ? "cyan" : "default"}
              onPress={() => setPainAfter(false)}
            />
            <StatPill
              label="Yes"
              value={painAfter ? "Selected" : "Off"}
              tone={painAfter ? "amber" : "default"}
              onPress={() => setPainAfter(true)}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Optional note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What helped or got in the way?"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            multiline
          />
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            label={saving ? "Saving..." : "Save reflection"}
            disabled={saving}
            onPress={() => saveReflection(false)}
          />
          <PrimaryButton
            label="Skip note"
            variant="secondary"
            disabled={saving}
            onPress={() => saveReflection(true)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RatingCard({
  label,
  value,
  onChange
}: {
  label: string;
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <Card>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.row}>
        {ratingValues.map((rating) => (
          <StatPill
            key={rating}
            label={`${rating}`}
            value={rating === value ? "Set" : "Tap"}
            tone={rating === value ? "cyan" : "default"}
            onPress={() => onChange(rating)}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  cardLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "800",
    marginTop: theme.spacing.xs
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  input: {
    minHeight: 110,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    textAlignVertical: "top"
  },
  actions: {
    gap: theme.spacing.sm
  }
});
