import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  fetchCommunityDashboard,
  type CommunityAppointment,
  type CommunityParticipant,
} from "../../../../src/features/community/api";
import { t } from "../../../../src/i18n";
import { colors, spacing } from "../../../../src/theme/tokens";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SU";
}

function serviceUserIdentifier(participant: CommunityParticipant) {
  return participant.internalIdentifier?.trim() || participant.id;
}

function ParticipantAvatar({ participant }: { participant: CommunityParticipant }) {
  const photoUrl = participant.photoUrl?.trim() || participant.photo?.trim();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials(participant.displayName)}</Text>
      {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatarImage} /> : null}
    </View>
  );
}

function formatDate(value?: string | null) {
  if (!value) return t("community.tbc", "TBC");
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function ParticipantRow({ participant, nextAppointment }: { participant: CommunityParticipant; nextAppointment?: CommunityAppointment }) {
  return (
    <Link
      href={{
        pathname: "/(tabs)/community/participants/[participantId]",
        params: { participantId: participant.id },
      }}
      asChild
    >
      <Pressable style={styles.row}>
        <ParticipantAvatar participant={participant} />
        <View style={styles.rowMain}>
          <Text style={styles.rowTitle}>{participant.displayName}</Text>
          <Text style={styles.identifier}>{serviceUserIdentifier(participant)}</Text>
          <Text style={styles.rowMeta}>{participant.referralSource || t("community.communityReferral", "Community referral")}</Text>
          <Text style={styles.rowMeta}>{participant.phone || participant.email || t("community.noContact", "No contact details")}</Text>
          <Text style={styles.dateMeta}>{t("community.startDate", "Start Date")}: {formatDate(participant.startDateUtc)}</Text>
          <Text style={styles.dateMeta}>{t("community.nextAppointmentDate", "Next Appointment Date")}: {nextAppointment ? formatDate(nextAppointment.startsAtUtc) : t("community.tbc", "TBC")}</Text>
        </View>
        <View style={styles.rowSide}>
          <Text style={styles.status}>{participant.status}</Text>
          <Text style={styles.plan}>{participant.currentCarePlan?.status ?? t("community.planNeeded", "Plan needed")}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function CommunityParticipantsScreen() {
  const [participants, setParticipants] = useState<CommunityParticipant[]>([]);
  const [appointments, setAppointments] = useState<CommunityAppointment[]>([]);
  const [sort, setSort] = useState<"name" | "startDate" | "nextAppointment">("name");
  const [ascending, setAscending] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCommunityDashboard()
      .then((dashboard) => {
        if (!active) return;
        setParticipants(dashboard.participants);
        setAppointments(dashboard.appointments);
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

  const activeCount = useMemo(
    () => participants.filter((participant) => participant.status?.toLowerCase() === "active").length,
    [participants],
  );
  const upcomingByParticipant = useMemo(() => {
    const now = Date.now();
    return appointments.reduce<Map<string, CommunityAppointment>>((result, appointment) => {
      if (!appointment.participantId || new Date(appointment.startsAtUtc).getTime() < now) return result;
      const current = result.get(appointment.participantId);
      if (!current || appointment.startsAtUtc < current.startsAtUtc) result.set(appointment.participantId, appointment);
      return result;
    }, new Map());
  }, [appointments]);
  const sortedParticipants = useMemo(() => participants
    .map((participant, index) => ({ participant, index, nextAppointment: upcomingByParticipant.get(participant.id) }))
    .sort((left, right) => {
      const leftValue = sort === "name" ? left.participant.displayName.localeCompare(right.participant.displayName) : sort === "startDate" ? new Date(left.participant.startDateUtc).getTime() : left.nextAppointment ? new Date(left.nextAppointment.startsAtUtc).getTime() : Number.POSITIVE_INFINITY;
      const rightValue = sort === "name" ? 0 : sort === "startDate" ? new Date(right.participant.startDateUtc).getTime() : right.nextAppointment ? new Date(right.nextAppointment.startsAtUtc).getTime() : Number.POSITIVE_INFINITY;
      const comparison = sort === "name" ? left.participant.displayName.localeCompare(right.participant.displayName) : leftValue - rightValue;
      return comparison === 0 ? left.index - right.index : ascending ? comparison : -comparison;
    }), [ascending, participants, sort, upcomingByParticipant]);
  const selectSort = (nextSort: "name" | "startDate" | "nextAppointment") => {
    if (nextSort === sort) setAscending((value) => !value);
    else {
      setSort(nextSort);
      setAscending(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Link href="/(tabs)/community" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>{t("community.backToCommunity", "Back to Community")}</Text>
          </Pressable>
        </Link>
        <Text style={styles.title}>{t("community.serviceUsers", "Service Users")}</Text>
        <Text style={styles.subtitle}>{activeCount} {t("community.active", "active")}</Text>
      </View>

      {loading ? <Text style={styles.mutedText}>{t("community.loading", "Loading Community...")}</Text> : null}
      {error ? <Text style={styles.errorText}>{t("community.sourceUnavailable", "Community data is unavailable.")} {error}</Text> : null}
      {!loading && participants.length === 0 ? (
        <Text style={styles.mutedText}>{t("community.noServiceUsers", "No service users returned by the API.")}</Text>
      ) : null}

      <View style={styles.sortRow}>
        <Pressable onPress={() => selectSort("name")} style={[styles.sortButton, sort === "name" ? styles.sortButtonActive : null]}><Text style={styles.sortText}>{t("community.serviceUserName", "Name")}</Text></Pressable>
        <Pressable onPress={() => selectSort("startDate")} style={[styles.sortButton, sort === "startDate" ? styles.sortButtonActive : null]}><Text style={styles.sortText}>{t("community.startDate", "Start Date")}</Text></Pressable>
        <Pressable onPress={() => selectSort("nextAppointment")} style={[styles.sortButton, sort === "nextAppointment" ? styles.sortButtonActive : null]}><Text style={styles.sortText}>{t("community.nextAppointmentDate", "Next Appointment Date")}</Text></Pressable>
      </View>

      {sortedParticipants.map(({ participant, nextAppointment }) => (
        <ParticipantRow key={participant.id} participant={participant} nextAppointment={nextAppointment} />
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
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.lg, marginBottom: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 8, backgroundColor: "#CFFAFE", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarText: { color: "#0E7490", fontWeight: "900" },
  avatarImage: { ...StyleSheet.absoluteFillObject },
  rowMain: { flex: 1 },
  rowSide: { alignItems: "flex-end", gap: 6 },
  rowTitle: { color: colors.text, fontSize: 17, fontWeight: "900", marginBottom: 4 },
  identifier: { color: "#0E7490", fontSize: 12, fontWeight: "900", marginBottom: 4 },
  rowMeta: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  dateMeta: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  status: { color: "#0E7490", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  plan: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
  mutedText: { color: colors.textMuted, fontSize: 14 },
  errorText: { color: colors.danger, fontSize: 14, marginBottom: spacing.md },
  sortRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  sortButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sortButtonActive: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  sortText: { color: colors.text, fontSize: 12, fontWeight: "800" },
});
