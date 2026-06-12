import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getGroupTherapySessionsForDate, type GroupTherapySessionRecord } from "../../../src/features/groupTherapy/repository";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = { unit?: string | string[] };

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ObservationsIndexScreen() {
  const rawUnit = takeFirst(useLocalSearchParams<RouteParams>().unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const sessionDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [sessions, setSessions] = useState<GroupTherapySessionRecord[]>([]);

  useEffect(() => {
    let active = true;
    getGroupTherapySessionsForDate(unitId, sessionDate).then((items) => {
      if (active) setSessions(items);
    });
    return () => {
      active = false;
    };
  }, [sessionDate, unitId]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("observations.title", "Observations")}</Text>
          <Text style={styles.subtitle}>{t("observations.subtitle", "Session observations and follow-up notes from group work.")}</Text>
        </View>
        <Link href={{ pathname: "/(tabs)/observations/create", params: { unit: unitId } }} asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t("observations.newObservation", "New Observation")}</Text>
          </Pressable>
        </Link>
      </View>

      {sessions.length === 0 ? <Text style={styles.mutedText}>{t("observations.empty", "No local observations have been captured yet.")}</Text> : null}
      {sessions.map((session) => (
        <Link key={session.id} href={{ pathname: "/(tabs)/observations/[submissionId]", params: { submissionId: session.id, unit: unitId } }} asChild>
          <Pressable style={styles.row}>
            <Text style={styles.rowTitle}>{session.id}</Text>
            <Text style={styles.rowMeta}>{session.status} | {session.payload.followUpResidentIds.length} follow-up</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  header: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted },
  primaryButton: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  primaryButtonText: { color: colors.surface, fontWeight: "800" },
  row: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  rowTitle: { color: colors.text, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted },
  mutedText: { color: colors.textMuted },
});
