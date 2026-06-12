import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getGroupTherapySession, type GroupTherapySessionRecord } from "../../../src/features/groupTherapy/repository";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = {
  sessionId?: string | string[];
  unit?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GroupTherapySessionScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const sessionId = takeFirst(params.sessionId) ?? "";
  const unitId = takeFirst(params.unit) ?? "detox";
  const [session, setSession] = useState<GroupTherapySessionRecord | null>(null);

  useEffect(() => {
    let active = true;
    getGroupTherapySession(sessionId).then((item) => {
      if (active) setSession(item);
    });
    return () => {
      active = false;
    };
  }, [sessionId]);

  const payload = session?.payload;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={{ pathname: "/(tabs)/therapy/today", params: { unit: unitId } }} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("groupTherapy.backToGroupTherapy", "Back to Group Therapy")}</Text>
        </Pressable>
      </Link>

      <View style={styles.card}>
        <Text style={styles.title}>{t("groupTherapy.continuityTitle", "Continuity")}</Text>
        <Text style={styles.subtitle}>{sessionId}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{t("groupTherapy.currentSpeaker", "Current Speaker")}</Text>
            <Text style={styles.infoValue}>{payload?.currentSpeakerResidentId ?? t("groupTherapy.noSpeaker", "Not selected")}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{t("groupTherapy.previousSpeaker", "Previous Speaker")}</Text>
            <Text style={styles.infoValue}>{payload?.previousSpeakerResidentId ?? t("groupTherapy.noSpeaker", "Not selected")}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{t("groupTherapy.followUp", "Follow-up")}</Text>
            <Text style={styles.infoValue}>{payload?.followUpResidentIds.length ?? 0}</Text>
          </View>
        </View>

        <Text style={styles.noteText}>{payload?.handoverNotes ?? t("groupTherapy.handover", "Handover Notes")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoBlock: {
    minWidth: 180,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.lg,
  },
});
