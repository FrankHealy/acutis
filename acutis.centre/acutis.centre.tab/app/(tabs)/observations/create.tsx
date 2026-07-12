import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { saveGroupTherapySession } from "../../../src/features/groupTherapy/repository";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = { unit?: string | string[] };

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CreateObservationScreen() {
  const router = useRouter();
  const rawUnit = takeFirst(useLocalSearchParams<RouteParams>().unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const [theme, setTheme] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async () => {
    const sessionDate = new Date().toISOString().slice(0, 10);
    const id = `observation-${unitId}-${Date.now()}`;
    await saveGroupTherapySession({
      id,
      unitId,
      sessionDate,
      status: "ready_to_sync",
      payload: {
        themeKeys: theme.trim() ? [theme.trim()] : [],
        currentSpeakerResidentId: speaker.trim() || undefined,
        attendance: {},
        followUpResidentIds: speaker.trim() ? [speaker.trim()] : [],
        handoverNotes: notes.trim() || undefined,
      },
    });
    router.replace({ pathname: "/(tabs)/observations/[submissionId]", params: { submissionId: id, unit: unitId } });
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("observations.newObservation", "New Observation")}</Text>
        <Text style={styles.label}>{t("groupTherapy.currentSpeaker", "Current Speaker")}</Text>
        <TextInput style={styles.input} value={speaker} onChangeText={setSpeaker} />
        <Text style={styles.label}>{t("groupTherapy.themes", "Themes")}</Text>
        <TextInput style={styles.input} value={theme} onChangeText={setTheme} />
        <Text style={styles.label}>{t("groupTherapy.handover", "Handover Notes")}</Text>
        <TextInput style={[styles.input, styles.textArea]} multiline value={notes} onChangeText={setNotes} />
        <Pressable style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>{t("observations.create", "Capture Observation")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.lg },
  label: { color: colors.text, fontWeight: "800", marginBottom: spacing.sm, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, color: colors.text },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  primaryButton: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginTop: spacing.lg },
  primaryButtonText: { color: colors.surface, fontWeight: "800" },
});
