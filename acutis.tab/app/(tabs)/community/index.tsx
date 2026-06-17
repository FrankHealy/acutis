import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  fetchCommunityDashboard,
  type CommunityAppointment,
  type CommunityDashboard,
  type CommunityParticipant,
  type CommunityProgrammeOffering,
} from "../../../src/features/community/api";
import { t } from "../../../src/i18n";
import { useAuth } from "../../../src/services/auth/AuthContext";
import { colors, spacing } from "../../../src/theme/tokens";

type CommunityView = "dashboard" | "service-users" | "operations" | "programmes";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SU";
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

function locationFromNotes(notes?: string | null) {
  return notes?.match(/Location:\s*([^.;]+)/i)?.[1]?.trim() ?? null;
}

function StatusPill({ value }: { value: string }) {
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusPillText}>{value || t("community.notSet", "Not set")}</Text>
    </View>
  );
}

function MetricCard({ label, value, accent = colors.text }: { label: string; value: string | number; accent?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function CommunityHeader({ onLogout }: { onLogout: () => void }) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const timeLabel = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={styles.headerShell}>
      <View style={styles.brandRow}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>A</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>{t("brand.title")}</Text>
          <Text style={styles.brandSubtitle}>{t("community.centre", "Arbour House")}</Text>
        </View>
        <View style={styles.unitPill}>
          <Text style={styles.unitPillLabel}>{t("community.currentUnitLabel", "Current Unit")}</Text>
          <Text style={styles.unitPillValue}>{t("community.unitName", "Community")}</Text>
        </View>
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t("auth.logout", "Logout")}</Text>
        </Pressable>
      </View>
      <View style={styles.headerMeta}>
        <Text style={styles.metaText}>{dateLabel}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{t("dashboard.currentTime")}: {timeLabel}</Text>
      </View>
    </View>
  );
}

function NavigationPills({ current, onChange }: { current: CommunityView; onChange: (view: CommunityView) => void }) {
  const items: Array<{ key: CommunityView; label: string }> = [
    { key: "dashboard", label: t("community.dashboard", "Dashboard") },
    { key: "service-users", label: t("community.serviceUsers", "Service Users") },
    { key: "operations", label: t("community.operations", "Operations") },
    { key: "programmes", label: t("community.programmes", "Programmes") },
  ];

  return (
    <View style={styles.navRow}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => onChange(item.key)}
          style={[styles.navPill, current === item.key ? styles.navPillActive : null]}
        >
          <Text style={[styles.navPillText, current === item.key ? styles.navPillTextActive : null]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SessionRow({ appointment }: { appointment: CommunityAppointment }) {
  const location = locationFromNotes(appointment.notes);
  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionTime}>
        <Text style={styles.sessionTimeText}>{formatTime(appointment.startsAtUtc)}</Text>
      </View>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{appointment.title}</Text>
        <Text style={styles.rowMeta}>
          {appointment.participantName ?? t("community.groupSession", "Group session")} · {appointment.deliveryMode}
        </Text>
        {location ? <Text style={styles.rowMeta}>{location}</Text> : null}
      </View>
      <StatusPill value={appointment.status} />
    </View>
  );
}

function ParticipantRow({ participant }: { participant: CommunityParticipant }) {
  return (
    <Link
      href={{
        pathname: "/(tabs)/community/participants/[participantId]",
        params: { participantId: participant.id },
      }}
      asChild
    >
      <Pressable style={styles.participantRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(participant.displayName)}</Text>
        </View>
        <View style={styles.rowMain}>
          <Text style={styles.rowTitle}>{participant.displayName}</Text>
          <Text style={styles.rowMeta}>{participant.referralSource || t("community.communityReferral", "Community referral")}</Text>
          <Text style={styles.rowMeta}>{participant.phone || participant.email || t("community.noContact", "No contact details")}</Text>
        </View>
        <View style={styles.rowSide}>
          <StatusPill value={participant.status} />
          <Text style={styles.carePlanText}>{participant.currentCarePlan?.status ?? t("community.planNeeded", "Plan needed")}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function ProgrammeCard({ offering }: { offering: CommunityProgrammeOffering }) {
  return (
    <View style={styles.programmeCard}>
      <Text style={styles.programmeTitle}>{offering.name}</Text>
      <Text style={styles.programmeMeta}>{offering.category} · {offering.cadence}</Text>
      <Text style={styles.programmeText}>{offering.description || t("community.noDescription", "No description available.")}</Text>
      <Text style={styles.programmeMeta}>{offering.nextSessionLabel || t("community.nextSessionUnset", "Next session not set")}</Text>
    </View>
  );
}

export default function CommunityScreen() {
  const { signOut } = useAuth();
  const [currentView, setCurrentView] = useState<CommunityView>("dashboard");
  const [dashboard, setDashboard] = useState<CommunityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const next = await fetchCommunityDashboard();
      setDashboard(next);
      setError(null);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const participants = dashboard?.participants ?? [];
  const appointments = dashboard?.appointments ?? [];
  const todayAppointments = useMemo(() => appointments.filter((appointment) => isToday(appointment.startsAtUtc)), [appointments]);
  const reportsDue = useMemo(
    () => todayAppointments.filter((appointment) => /report due|meeting/i.test(`${appointment.notes ?? ""} ${appointment.title}`)).length,
    [todayAppointments],
  );
  const outreach = useMemo(
    () => todayAppointments.filter((appointment) => (locationFromNotes(appointment.notes) ?? "").toLowerCase().includes("shelter")).length,
    [todayAppointments],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadDashboard("refresh")} />}
    >
      <CommunityHeader onLogout={() => void signOut()} />
      <NavigationPills current={currentView} onChange={setCurrentView} />

      {error ? <Text style={styles.errorText}>{t("community.sourceUnavailable", "Community data is unavailable.")} {error}</Text> : null}
      {loading ? <Text style={styles.mutedText}>{t("community.loading", "Loading Community...")}</Text> : null}

      {currentView === "dashboard" ? (
        <>
          <View style={styles.metricRow}>
            <MetricCard label={t("community.activeServiceUsers", "Active Service Users")} value={participants.length} accent="#0E7490" />
            <MetricCard label={t("community.appointmentsToday", "Appointments Today")} value={todayAppointments.length} accent="#2563EB" />
            <MetricCard label={t("community.outreach", "Outreach")} value={outreach} accent="#16A34A" />
            <MetricCard label={t("community.reports", "Reports")} value={reportsDue} accent="#B45309" />
          </View>
          <View style={styles.card}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t("community.todaySchedule", "Today")}</Text>
              <Pressable onPress={() => setCurrentView("operations")} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>{t("community.openSchedule", "Open schedule")}</Text>
              </Pressable>
            </View>
            {todayAppointments.length === 0 ? (
              <Text style={styles.mutedText}>{t("community.noSessionsToday", "No sessions scheduled for today.")}</Text>
            ) : (
              todayAppointments.map((appointment) => <SessionRow key={appointment.id} appointment={appointment} />)
            )}
          </View>
        </>
      ) : null}

      {currentView === "service-users" ? (
        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t("community.serviceUsers", "Service Users")}</Text>
            <Text style={styles.countText}>{participants.length} {t("community.active", "active")}</Text>
          </View>
          {participants.length === 0 ? (
            <Text style={styles.mutedText}>{t("community.noServiceUsers", "No service users returned by the API.")}</Text>
          ) : (
            participants.map((participant) => <ParticipantRow key={participant.id} participant={participant} />)
          )}
        </View>
      ) : null}

      {currentView === "operations" ? (
        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t("community.operations", "Operations")}</Text>
            <Text style={styles.countText}>{appointments.length} {t("community.sessions", "sessions")}</Text>
          </View>
          {appointments.length === 0 ? (
            <Text style={styles.mutedText}>{t("community.noSessions", "No sessions returned by the API.")}</Text>
          ) : (
            appointments.map((appointment) => <SessionRow key={appointment.id} appointment={appointment} />)
          )}
        </View>
      ) : null}

      {currentView === "programmes" ? (
        <View style={styles.programmeGrid}>
          {(dashboard?.programmeOfferings ?? []).length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.mutedText}>{t("community.noProgrammes", "No programme offerings returned by the API.")}</Text>
            </View>
          ) : (
            dashboard?.programmeOfferings.map((offering) => <ProgrammeCard key={offering.code} offering={offering} />)
          )}
        </View>
      ) : null}

      <Link href="/(tabs)/dashboard" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t("community.otherUnits", "Open Detox / Alcohol")}</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  headerShell: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  brandRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.md },
  brandBadge: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#2F5BCE", alignItems: "center", justifyContent: "center" },
  brandBadgeText: { color: colors.surface, fontSize: 26, fontWeight: "900" },
  brandTitle: { fontSize: 26, fontWeight: "900", color: colors.text },
  brandSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  unitPill: { marginLeft: "auto", minWidth: 170, borderWidth: 1, borderRadius: 18, borderColor: "#BAE6FD", backgroundColor: "#ECFEFF", paddingHorizontal: 14, paddingVertical: 10 },
  unitPillLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.1, color: colors.textMuted, fontWeight: "700", marginBottom: 2 },
  unitPillValue: { fontSize: 16, fontWeight: "900", color: "#0E7490" },
  logoutButton: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface },
  logoutText: { color: colors.primary, fontWeight: "800" },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  metaText: { color: colors.textMuted, fontSize: 14 },
  metaDot: { color: "#94A3B8", fontSize: 14 },
  navRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  navPill: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  navPillActive: { borderColor: "#67E8F9", backgroundColor: "#ECFEFF" },
  navPillText: { color: colors.textMuted, fontWeight: "800" },
  navPillTextActive: { color: "#0E7490" },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
  metricCard: { flexGrow: 1, minWidth: 180, backgroundColor: colors.surface, borderRadius: 18, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  metricLabel: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  metricValue: { fontSize: 32, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  countText: { color: colors.textMuted, fontWeight: "800", textTransform: "uppercase" },
  smallButton: { borderRadius: 8, backgroundColor: "#ECFEFF", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  smallButtonText: { color: "#0E7490", fontWeight: "800" },
  participantRow: { flexDirection: "row", gap: spacing.md, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  sessionRow: { flexDirection: "row", gap: spacing.md, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 12, backgroundColor: "#CFFAFE", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#0E7490", fontWeight: "900" },
  rowMain: { flex: 1 },
  rowSide: { alignItems: "flex-end", gap: 6 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  carePlanText: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
  statusPill: { borderRadius: 999, backgroundColor: "#F1F5F9", paddingHorizontal: spacing.md, paddingVertical: 6 },
  statusPillText: { color: colors.text, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  sessionTime: { width: 64, alignItems: "center" },
  sessionTimeText: { color: "#0E7490", fontWeight: "900" },
  programmeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
  programmeCard: { flexGrow: 1, minWidth: 280, maxWidth: 420, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  programmeTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: spacing.sm },
  programmeMeta: { color: colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: spacing.sm },
  programmeText: { color: colors.text, fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
  secondaryButton: { alignSelf: "flex-start", borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  secondaryButtonText: { color: colors.primary, fontWeight: "800" },
  mutedText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  errorText: { color: colors.danger, fontSize: 14, marginBottom: spacing.md },
});
