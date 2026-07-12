import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { createIncident, fetchIncidentTypes, type IncidentScope, type IncidentType } from "../../../src/features/incidents/api";
import { fetchResidents, type ResidentListItem } from "../../../src/features/residents/api";
import { isRollCallUnitId, type RollCallUnitId } from "../../../src/features/rollCall/units";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = {
  unit?: string | string[];
  residentId?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CreateIncidentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const rawUnit = takeFirst(params.unit) ?? "detox";
  const unitId: RollCallUnitId = isRollCallUnitId(rawUnit) ? rawUnit : "detox";
  const prefilledResidentId = takeFirst(params.residentId);
  const [types, setTypes] = useState<IncidentType[]>([]);
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [incidentTypeId, setIncidentTypeId] = useState(0);
  const [scope, setScope] = useState<IncidentScope>(prefilledResidentId ? "resident" : "unit");
  const [residentId, setResidentId] = useState(prefilledResidentId ?? "");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchIncidentTypes(), fetchResidents(unitId)])
      .then(([typeRows, residentRows]) => {
        if (!active) return;
        setTypes(typeRows);
        setResidents(residentRows);
        setIncidentTypeId(typeRows[0]?.id ?? 0);
      })
      .catch((loadError) => {
        if (active) setError((loadError as Error).message);
      });
    return () => {
      active = false;
    };
  }, [unitId]);

  const selectedResident = residents.find((resident) => resident.residentGuid === residentId);

  const submit = async () => {
    if (!incidentTypeId) {
      setError("Incident type is required.");
      return;
    }
    if (!summary.trim()) {
      setError("Summary is required.");
      return;
    }
    if (scope === "resident" && !selectedResident) {
      setError("Resident is required for resident-scope incidents.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createIncident(unitId, {
        incidentTypeId,
        scope,
        residentId: scope === "resident" ? selectedResident?.residentGuid ?? null : null,
        residentCaseId: scope === "resident" ? selectedResident?.residentCaseId ?? null : null,
        episodeId: scope === "resident" ? selectedResident?.episodeId ?? null : null,
        occurredAtUtc: new Date().toISOString(),
        summary: summary.trim(),
        notes: notes.trim() || null,
        detailsJson: "{}",
      });
      router.replace({ pathname: "/(tabs)/incidents", params: { unit: unitId } });
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("incidents.newIncident", "New Incident")}</Text>

        <Text style={styles.label}>{t("incidents.type", "Type")}</Text>
        <View style={styles.optionRow}>
          {types.map((type) => (
            <Pressable key={type.id} style={[styles.option, incidentTypeId === type.id ? styles.optionActive : null]} onPress={() => setIncidentTypeId(type.id)}>
              <Text style={[styles.optionText, incidentTypeId === type.id ? styles.optionTextActive : null]}>{type.defaultName}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{t("incidents.scope", "Scope")}</Text>
        <View style={styles.optionRow}>
          {(["resident", "unit", "centre"] as const).map((value) => (
            <Pressable key={value} style={[styles.option, scope === value ? styles.optionActive : null]} onPress={() => setScope(value)}>
              <Text style={[styles.optionText, scope === value ? styles.optionTextActive : null]}>{value}</Text>
            </Pressable>
          ))}
        </View>

        {scope === "resident" ? (
          <>
            <Text style={styles.label}>{t("incidents.resident", "Resident")}</Text>
            <View style={styles.optionRow}>
              {residents.slice(0, 8).map((resident) => (
                <Pressable key={resident.residentGuid} style={[styles.option, residentId === resident.residentGuid ? styles.optionActive : null]} onPress={() => setResidentId(resident.residentGuid)}>
                  <Text style={[styles.optionText, residentId === resident.residentGuid ? styles.optionTextActive : null]}>{resident.firstName} {resident.surname}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.label}>{t("incidents.summary", "Summary")}</Text>
        <TextInput style={styles.input} value={summary} onChangeText={setSummary} />

        <Text style={styles.label}>{t("incidents.notes", "Notes")}</Text>
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={submit} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? t("incidents.creating", "Creating...") : t("incidents.create", "Create Incident")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
  label: { color: colors.text, fontWeight: "800", marginBottom: spacing.sm, marginTop: spacing.md },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { color: colors.text, fontWeight: "700" },
  optionTextActive: { color: colors.surface },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, color: colors.text, backgroundColor: colors.surface },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  primaryButton: { alignSelf: "flex-start", backgroundColor: colors.danger, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginTop: spacing.lg },
  primaryButtonText: { color: colors.surface, fontWeight: "800" },
  errorText: { color: colors.danger, marginTop: spacing.md },
});
