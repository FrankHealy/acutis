import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getGroupTherapySession, type GroupTherapySessionRecord } from "../../../src/features/groupTherapy/repository";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = { submissionId?: string | string[]; unit?: string | string[] };

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ObservationDetailScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const submissionId = takeFirst(params.submissionId) ?? "";
  const unitId = takeFirst(params.unit) ?? "detox";
  const [session, setSession] = useState<GroupTherapySessionRecord | null>(null);

  useEffect(() => {
    let active = true;
    getGroupTherapySession(submissionId).then((item) => {
      if (active) setSession(item);
    });
    return () => {
      active = false;
    };
  }, [submissionId]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={{ pathname: "/(tabs)/observations", params: { unit: unitId } }} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("observations.back", "Back to observations")}</Text>
        </Pressable>
      </Link>
      <View style={styles.card}>
        <Text style={styles.title}>{submissionId}</Text>
        <Text style={styles.subtitle}>{session?.status ?? ""}</Text>
        <Info label={t("groupTherapy.currentSpeaker", "Current Speaker")} value={session?.payload.currentSpeakerResidentId ?? "-"} />
        <Info label={t("groupTherapy.previousSpeaker", "Previous Speaker")} value={session?.payload.previousSpeakerResidentId ?? "-"} />
        <Info label={t("groupTherapy.themes", "Themes")} value={session?.payload.themeKeys.join(", ") || "-"} />
        <Info label={t("groupTherapy.handover", "Handover Notes")} value={session?.payload.handoverNotes ?? "-"} />
      </View>
    </ScrollView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  backButton: { alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.md },
  backButtonText: { color: colors.primary, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  info: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.md },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 4 },
  infoValue: { color: colors.text, fontWeight: "700" },
});
