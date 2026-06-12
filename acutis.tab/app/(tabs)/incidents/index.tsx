import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchIncidents, type IncidentRecord } from "../../../src/features/incidents/api";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = { unit?: string | string[] };

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function IncidentsIndexScreen() {
  const rawUnit = takeFirst(useLocalSearchParams<RouteParams>().unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchIncidents(unitId)
      .then((items) => {
        if (active) {
          setIncidents(items);
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

  const summary = useMemo(() => ({
    resident: incidents.filter((item) => item.scope === "resident").length,
    unit: incidents.filter((item) => item.scope === "unit").length,
    centre: incidents.filter((item) => item.scope === "centre").length,
  }), [incidents]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("incidents.title", "Incidents")}</Text>
          <Text style={styles.subtitle}>{t("incidents.subtitle", "Resident, unit and centre operational incidents.")}</Text>
        </View>
        <Link href={{ pathname: "/(tabs)/incidents/create", params: { unit: unitId } }} asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t("incidents.newIncident", "New Incident")}</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.metricRow}>
        <Metric label="Resident" value={summary.resident} />
        <Metric label="Unit" value={summary.unit} />
        <Metric label="Centre" value={summary.centre} />
      </View>

      {loading ? <Text style={styles.mutedText}>{t("incidents.loading", "Loading incidents...")}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!loading && incidents.length === 0 ? <Text style={styles.mutedText}>{t("incidents.empty", "No incidents recorded yet.")}</Text> : null}

      {incidents.map((incident) => (
        <Link key={incident.id} href={{ pathname: "/(tabs)/incidents/[incidentId]", params: { incidentId: incident.id, unit: unitId } }} asChild>
          <Pressable style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>{incident.summary}</Text>
              <Text style={styles.rowMeta}>{incident.incidentTypeName} | {incident.scope} | {formatDate(incident.occurredAtUtc)}</Text>
              {incident.residentName ? <Text style={styles.rowMeta}>{incident.residentName}</Text> : null}
            </View>
            <Text style={styles.scope}>{incident.scope}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  header: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap", marginBottom: spacing.lg },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted },
  primaryButton: { backgroundColor: colors.danger, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignSelf: "flex-start" },
  primaryButtonText: { color: colors.surface, fontWeight: "800" },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
  metricCard: { minWidth: 140, flexGrow: 1, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  metricLabel: { color: colors.textMuted, marginBottom: spacing.sm },
  metricValue: { color: colors.text, fontSize: 30, fontWeight: "900" },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.lg, marginBottom: spacing.md },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  scope: { color: colors.danger, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  mutedText: { color: colors.textMuted },
  errorText: { color: colors.danger, marginBottom: spacing.md },
});
