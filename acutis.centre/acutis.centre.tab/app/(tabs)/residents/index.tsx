import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchResidents, type ResidentListItem } from "../../../src/features/residents/api";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = {
  unit?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ResidentsIndexScreen() {
  const rawUnit = takeFirst(useLocalSearchParams<RouteParams>().unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchResidents(unitId)
      .then((items) => {
        if (active) {
          setResidents(items);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (active) setError((loadError as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [unitId]);

  const flags = useMemo(
    () => ({
      probation: residents.filter((resident) => resident.isOnProbation).length,
      previous: residents.filter((resident) => resident.isPreviousResident).length,
      dietary: residents.filter((resident) => resident.dietaryNeedsCode > 0).length,
    }),
    [residents]
  );

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("residents.title", "Residents")}</Text>
        <Text style={styles.subtitle}>{t("residents.subtitle", "Current residents, rooms and programme continuity.")}</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{t("dashboard.activeResidents", "Active Residents")}</Text>
          <Text style={styles.metricValue}>{residents.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{t("residents.riskFlags", "Operational Flags")}</Text>
          <Text style={styles.metricValue}>{flags.probation + flags.previous + flags.dietary}</Text>
        </View>
      </View>

      {loading ? <Text style={styles.mutedText}>{t("residents.loading", "Loading residents...")}</Text> : null}
      {error ? <Text style={styles.errorText}>{t("residents.sourceUnavailable", "Live resident data is unavailable.")} {error}</Text> : null}
      {!loading && residents.length === 0 ? <Text style={styles.mutedText}>{t("residents.empty", "No residents are currently available.")}</Text> : null}

      {residents.map((resident) => (
        <Link
          key={resident.residentGuid}
          href={{
            pathname: "/(tabs)/residents/[residentId]",
            params: { residentId: resident.residentGuid, unit: unitId },
          }}
          asChild
        >
          <Pressable style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{resident.firstName.charAt(0)}{resident.surname.charAt(0)}</Text>
            </View>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>{resident.firstName} {resident.surname}</Text>
              <Text style={styles.rowMeta}>
                {t("residents.room", "Room")} {resident.roomNumber || "-"} {resident.bedCode ? `| ${resident.bedCode}` : ""}
              </Text>
              <Text style={styles.rowMeta}>
                {resident.programmeType ?? t("residents.programme", "Programme")} | {t("residents.week", "Week")} {resident.weekNumber}
              </Text>
            </View>
            <Text style={styles.status}>{resident.caseStatus ?? resident.participationMode ?? ""}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  header: { marginBottom: spacing.lg },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
  metricCard: { flexGrow: 1, minWidth: 180, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  metricLabel: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  metricValue: { color: colors.text, fontSize: 32, fontWeight: "900" },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center", backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.surface, fontWeight: "900" },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 17, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  status: { color: colors.primary, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  mutedText: { color: colors.textMuted, fontSize: 14 },
  errorText: { color: colors.danger, fontSize: 14, marginBottom: spacing.md },
});
