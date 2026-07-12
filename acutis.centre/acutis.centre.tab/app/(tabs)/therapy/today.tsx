import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  getGroupTherapySessionsForDate,
  saveGroupTherapySession,
  type GroupTherapySessionRecord,
} from "../../../src/features/groupTherapy/repository";
import { t } from "../../../src/i18n";
import { colors, spacing } from "../../../src/theme/tokens";

type RouteParams = {
  unit?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function GroupTherapyTodayScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const unitId = takeFirst(params.unit) ?? "detox";
  const sessionDate = useMemo(() => toDateKey(new Date()), []);
  const [sessions, setSessions] = useState<GroupTherapySessionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getGroupTherapySessionsForDate(unitId, sessionDate)
      .then((items) => {
        if (active) setSessions(items);
      })
      .catch((loadError) => {
        if (active) setError((loadError as Error).message);
      });

    return () => {
      active = false;
    };
  }, [sessionDate, unitId]);

  const startSession = async () => {
    const session = await saveGroupTherapySession({
      id: `gt-${unitId}-${sessionDate}-am`,
      unitId,
      sessionDate,
      status: "in_progress",
      payload: {
        themeKeys: [],
        attendance: {},
        followUpResidentIds: [],
      },
    });

    setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("groupTherapy.todayTitle", "Today's Group Therapy")}</Text>
        <Text style={styles.subtitle}>
          {t("groupTherapy.todaySubtitle", "Start or continue the current tablet session.")}
        </Text>
        <Pressable style={styles.primaryButton} onPress={startSession}>
          <Text style={styles.primaryButtonText}>{t("groupTherapy.startSession", "Start Session")}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {sessions.length === 0 ? (
        <Text style={styles.emptyText}>{t("groupTherapy.noSessions", "No local sessions have been started today.")}</Text>
      ) : null}

      {sessions.map((session) => (
        <Link
          key={session.id}
          href={{ pathname: "/(tabs)/therapy/[sessionId]", params: { sessionId: session.id, unit: unitId } }}
          asChild
        >
          <Pressable style={styles.sessionRow}>
            <View>
              <Text style={styles.sessionTitle}>{session.id}</Text>
              <Text style={styles.sessionMeta}>{t("groupTherapy.status", "Status")}: {session.status}</Text>
            </View>
            <Text style={styles.sessionMeta}>
              {session.payload.themeKeys.length} {t("groupTherapy.themes", "Themes")}
            </Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  header: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "800",
  },
  sessionRow: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sessionMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.md,
  },
});
