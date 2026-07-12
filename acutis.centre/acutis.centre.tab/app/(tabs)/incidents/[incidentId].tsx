import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchIncidents, type IncidentRecord } from "../../../src/features/incidents/api";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = { incidentId?: string | string[]; unit?: string | string[] };

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function IncidentDetailScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const incidentId = takeFirst(params.incidentId) ?? "";
  const rawUnit = takeFirst(params.unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const [incident, setIncident] = useState<IncidentRecord | null>(null);

  useEffect(() => {
    let active = true;
    fetchIncidents(unitId).then((items) => {
      if (active) setIncident(items.find((item) => item.id === incidentId) ?? null);
    });
    return () => {
      active = false;
    };
  }, [incidentId, unitId]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={{ pathname: "/(tabs)/incidents", params: { unit: unitId } }} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("incidents.back", "Back to incidents")}</Text>
        </Pressable>
      </Link>
      <View style={styles.card}>
        <Text style={styles.title}>{incident?.summary ?? incidentId}</Text>
        <Text style={styles.subtitle}>{incident?.incidentTypeName ?? t("incidents.type", "Type")}</Text>
        <Info label={t("incidents.scope", "Scope")} value={incident?.scope ?? "-"} />
        <Info label={t("incidents.resident", "Resident")} value={incident?.residentName ?? "-"} />
        <Info label={t("incidents.occurred", "Occurred")} value={incident ? new Date(incident.occurredAtUtc).toLocaleString("en-GB") : "-"} />
        <Info label={t("incidents.notes", "Notes")} value={incident?.notes ?? "-"} />
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
  infoValue: { color: colors.text, fontSize: 15, fontWeight: "700" },
});
