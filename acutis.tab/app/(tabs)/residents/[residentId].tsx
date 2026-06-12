import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchResidents, type ResidentListItem } from "../../../src/features/residents/api";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = {
  residentId?: string | string[];
  unit?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ResidentDetailScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const residentId = takeFirst(params.residentId) ?? "";
  const rawUnit = takeFirst(params.unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const [resident, setResident] = useState<ResidentListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchResidents(unitId)
      .then((items) => {
        if (active) setResident(items.find((item) => item.residentGuid === residentId) ?? null);
      })
      .catch((loadError) => {
        if (active) setError((loadError as Error).message);
      });
    return () => {
      active = false;
    };
  }, [residentId, unitId]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={{ pathname: "/(tabs)/residents", params: { unit: unitId } }} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("residents.back", "Back to residents")}</Text>
        </Pressable>
      </Link>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.title}>{resident ? `${resident.firstName} ${resident.surname}` : residentId}</Text>
        <Text style={styles.subtitle}>{resident?.centreEpisodeCode ?? resident?.psn ?? ""}</Text>

        <View style={styles.grid}>
          <Info label={t("residents.room", "Room")} value={`${resident?.roomNumber ?? "-"} ${resident?.bedCode ?? ""}`.trim()} />
          <Info label={t("residents.programme", "Programme")} value={resident?.programmeType ?? "-"} />
          <Info label={t("residents.week", "Week")} value={String(resident?.weekNumber ?? "-")} />
          <Info label={t("residents.riskFlags", "Operational Flags")} value={buildFlags(resident)} />
        </View>

        <Link href={{ pathname: "/(tabs)/incidents/create", params: { unit: unitId, residentId } }} asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t("residents.openIncident", "New incident")}</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

function buildFlags(resident: ResidentListItem | null) {
  if (!resident) return "-";
  const flags = [
    resident.isPreviousResident ? "Previous resident" : null,
    resident.isOnProbation ? "Probation" : null,
    resident.dietaryNeedsCode > 0 ? "Dietary needs" : null,
    resident.isSnorer ? "Snorer" : null,
  ].filter(Boolean);
  return flags.join(", ") || "None";
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
  title: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
  info: { minWidth: 180, flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: spacing.sm },
  infoValue: { color: colors.text, fontSize: 15, fontWeight: "800" },
  primaryButton: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  primaryButtonText: { color: colors.surface, fontWeight: "800" },
  errorText: { color: colors.danger, marginBottom: spacing.md },
});
