import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getSyncQueueEntries } from "../../../src/db/schema";
import { getOfflinePolicyStatus, type OfflinePolicyStatus } from "../../../src/services/api/bootstrap";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type SyncQueueEntry = {
  id: string;
  action: string;
  payload: string;
  status: string;
  attempts: number;
  createdAtClient: string;
  updatedAtClient: string;
};

export default function SyncIndexScreen() {
  const [entries, setEntries] = useState<SyncQueueEntry[]>([]);
  const [policy, setPolicy] = useState<OfflinePolicyStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getSyncQueueEntries(), getOfflinePolicyStatus().catch(() => null)])
      .then(([rows, policyStatus]) => {
        if (!active) return;
        setEntries(rows as SyncQueueEntry[]);
        setPolicy(policyStatus);
      })
      .catch((loadError) => {
        if (active) setError((loadError as Error).message);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("sync.title", "Sync")}</Text>
        <Text style={styles.subtitle}>{t("sync.subtitle", "Queued tablet work waiting for server confirmation.")}</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>{t("sync.pending", "Pending")}</Text>
        <Text style={styles.metricValue}>{entries.filter((entry) => entry.status === "pending").length}</Text>
      </View>
      {policy ? <Text style={styles.mutedText}>Server time: {policy.serverTimeUtc}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {entries.length === 0 ? <Text style={styles.mutedText}>{t("sync.empty", "No pending sync items.")}</Text> : null}
      {entries.map((entry) => (
        <View key={entry.id} style={styles.row}>
          <Text style={styles.rowTitle}>{entry.action}</Text>
          <Text style={styles.rowMeta}>{entry.status} | attempts {entry.attempts}</Text>
          <Text style={styles.rowMeta}>{entry.updatedAtClient}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  header: { marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted },
  metricCard: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
  metricLabel: { color: colors.textMuted, marginBottom: spacing.sm },
  metricValue: { color: colors.text, fontSize: 32, fontWeight: "900" },
  row: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.md },
  rowTitle: { color: colors.text, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 13 },
  mutedText: { color: colors.textMuted, marginBottom: spacing.sm },
  errorText: { color: colors.danger, marginBottom: spacing.sm },
});
