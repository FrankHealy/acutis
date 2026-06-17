import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  fetchCommunityAppointments,
  type CommunityAppointment,
} from "../../../src/features/community/api";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function SessionRow({ appointment }: { appointment: CommunityAppointment }) {
  return (
    <View style={styles.row}>
      <View style={styles.timeBox}>
        <Text style={styles.time}>{formatTime(appointment.startsAtUtc)}</Text>
      </View>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{appointment.title}</Text>
        <Text style={styles.rowMeta}>
          {appointment.participantName ?? t("community.groupSession", "Group session")} · {appointment.deliveryMode}
        </Text>
        {appointment.notes ? <Text style={styles.rowMeta}>{appointment.notes}</Text> : null}
      </View>
      <Text style={styles.status}>{appointment.status}</Text>
    </View>
  );
}

export default function CommunitySessionsScreen() {
  const [appointments, setAppointments] = useState<CommunityAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCommunityAppointments()
      .then((items) => {
        if (!active) return;
        setAppointments(items);
        setError(null);
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
  }, []);

  const grouped = useMemo(() => {
    const next = new Map<string, CommunityAppointment[]>();
    appointments
      .slice()
      .sort((left, right) => left.startsAtUtc.localeCompare(right.startsAtUtc))
      .forEach((appointment) => {
        const key = dayKey(appointment.startsAtUtc);
        next.set(key, [...(next.get(key) ?? []), appointment]);
      });
    return Array.from(next.entries());
  }, [appointments]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Link href="/(tabs)/community" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>{t("community.backToCommunity", "Back to Community")}</Text>
          </Pressable>
        </Link>
        <Text style={styles.title}>{t("community.sessions", "Sessions")}</Text>
        <Text style={styles.subtitle}>{appointments.length} {t("community.sessions", "sessions")}</Text>
      </View>

      {loading ? <Text style={styles.mutedText}>{t("community.loading", "Loading Community...")}</Text> : null}
      {error ? <Text style={styles.errorText}>{t("community.sourceUnavailable", "Community data is unavailable.")} {error}</Text> : null}
      {!loading && appointments.length === 0 ? (
        <Text style={styles.mutedText}>{t("community.noSessions", "No sessions returned by the API.")}</Text>
      ) : null}

      {grouped.map(([dateKey, items]) => (
        <View key={dateKey} style={styles.card}>
          <Text style={styles.sectionTitle}>{formatDay(items[0].startsAtUtc)}</Text>
          {items.map((appointment) => <SessionRow key={appointment.id} appointment={appointment} />)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  header: { marginBottom: spacing.lg },
  backButton: { alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.md },
  backButtonText: { color: colors.primary, fontWeight: "800" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginBottom: spacing.md },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  timeBox: { width: 64, alignItems: "center" },
  time: { color: "#0E7490", fontWeight: "900" },
  rowMain: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  status: { color: "#0E7490", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  mutedText: { color: colors.textMuted, fontSize: 14 },
  errorText: { color: colors.danger, fontSize: 14, marginBottom: spacing.md },
});
