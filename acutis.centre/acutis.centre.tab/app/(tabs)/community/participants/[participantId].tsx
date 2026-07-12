import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  fetchCommunityParticipantDetail,
  type CommunityAppointment,
  type CommunityParticipant,
} from "../../../../src/features/community/api";
import { t } from "../../../../src/i18n";
import { colors, spacing } from "../../../../src/theme/tokens";

type RouteParams = {
  participantId?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string | null) {
  if (!value) return t("community.notSet", "Not set");
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function formatSession(value: string) {
  return new Date(value).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SU";
}

function serviceUserIdentifier(participant: CommunityParticipant | null, fallback: string) {
  return participant?.internalIdentifier?.trim() || fallback;
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

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || t("community.notSet", "Not set")}</Text>
    </View>
  );
}

function SessionRow({ appointment }: { appointment: CommunityAppointment }) {
  return (
    <View style={styles.sessionRow}>
      <Text style={styles.sessionTitle}>{appointment.title}</Text>
      <Text style={styles.sessionMeta}>{formatSession(appointment.startsAtUtc)} · {appointment.deliveryMode} · {appointment.status}</Text>
    </View>
  );
}

export default function CommunityParticipantDetailScreen() {
  const participantId = takeFirst(useLocalSearchParams<RouteParams>().participantId) ?? "";
  const [participant, setParticipant] = useState<CommunityParticipant | null>(null);
  const [appointments, setAppointments] = useState<CommunityAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchCommunityParticipantDetail(participantId)
      .then((detail) => {
        if (!active) return;
        setParticipant(detail.participant);
        setAppointments(detail.appointments);
        setError(null);
      })
      .catch((loadError) => {
        if (active) setError((loadError as Error).message);
      });

    return () => {
      active = false;
    };
  }, [participantId]);

  const carePlan = participant?.currentCarePlan ?? null;
  const latestAssessment = useMemo(
    () => [...(participant?.assessments ?? [])].sort((left, right) => right.completedAtUtc.localeCompare(left.completedAtUtc))[0],
    [participant?.assessments],
  );
  const carePlans = participant?.carePlans?.length ? participant.carePlans : carePlan ? [carePlan] : [];

  return (
    <ScrollView contentContainerStyle={styles.screen} stickyHeaderIndices={[0]}>
      <View style={styles.stickyHeader}>
        <Link href="/(tabs)/community/participants" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>{t("community.backToServiceUsers", "Back to Service Users")}</Text>
          </Pressable>
        </Link>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("community.fullDetails", "Full Details")}</Text>
        <View style={styles.profileHead}>
          {participant ? <ParticipantAvatar participant={participant} /> : null}
          <View style={styles.profileText}>
            <Text style={styles.title}>{participant?.displayName ?? participantId}</Text>
            <Text style={styles.identifier}>{serviceUserIdentifier(participant, participantId)}</Text>
            <Text style={styles.subtitle}>{participant?.referralSource || t("community.communityReferral", "Community referral")}</Text>
          </View>
        </View>
        {participant ? (
          <View style={styles.actionRow}>
            <Link
              href={{
                pathname: "/(tabs)/community/initial-assessment",
                params: { participantId: participant.id, resident: participant.displayName },
              }}
              asChild
            >
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{latestAssessment ? "Open Assessment" : "New Assessment"}</Text>
              </Pressable>
            </Link>
          </View>
        ) : null}
        <View style={styles.grid}>
          <Info label={t("community.status", "Status")} value={participant?.status} />
          <Info label={t("community.preferredName", "Preferred Name")} value={participant?.preferredName} />
          <Info label={t("community.phone", "Phone")} value={participant?.phone} />
          <Info label={t("community.email", "Email")} value={participant?.email} />
          <Info label={t("community.counsellor", "Counsellor")} value={participant?.counsellorDisplayName} />
          <Info label={t("community.carePlanStatus", "Care Plan")} value={carePlan?.status} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("community.carePlan", "Care Plan")}</Text>
        {carePlan ? (
          <View style={styles.grid}>
            <Info label={t("community.needs", "Needs")} value={carePlan.needs} />
            <Info label={t("community.strengths", "Strengths")} value={carePlan.strengths} />
            <Info label={t("community.risks", "Risks")} value={carePlan.risks} />
            <Info label={t("community.goals", "Goals")} value={carePlan.goals} />
            <Info label={t("community.actions", "Actions")} value={carePlan.actions} />
            <Info label={t("community.reviewDate", "Review Date")} value={formatDate(carePlan.reviewDate)} />
          </View>
        ) : (
          <Text style={styles.mutedText}>{t("community.noCarePlan", "No care plan has been returned by the API.")}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("community.carePlanHistory", "Care Plan History")}</Text>
        {carePlans.length === 0 ? (
          <Text style={styles.mutedText}>{t("community.noCarePlan", "No care plan has been returned by the API.")}</Text>
        ) : (
          carePlans.map((plan) => (
            <View key={plan.id} style={styles.historyRow}>
              <Text style={styles.sessionTitle}>{plan.status} · review {formatDate(plan.reviewDate)}</Text>
              <Text style={styles.sessionMeta}>{plan.goals || plan.needs || "No care-plan narrative captured."}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("community.therapyHistory", "Therapy History")}</Text>
        {appointments.length === 0 ? (
          <Text style={styles.mutedText}>{t("community.noParticipantSessions", "No sessions returned for this service user.")}</Text>
        ) : (
          appointments.map((appointment) => <SessionRow key={appointment.id} appointment={appointment} />)
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assessment History</Text>
        {(participant?.assessments ?? []).length > 0 ? (
          (participant?.assessments ?? []).map((assessment) => (
            <View key={assessment.id} style={styles.historyRow}>
              <Text style={styles.sessionTitle}>{assessment.assessmentType} · {formatDate(assessment.completedAtUtc)}</Text>
              <Text style={styles.sessionMeta}>{assessment.outcome || assessment.riskSummary || "Assessment details available in the assessment screen."}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>{t("community.noAssessment", "No assessment has been returned by the API.")}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, backgroundColor: colors.surfaceMuted },
  stickyHeader: { backgroundColor: colors.surfaceMuted, paddingTop: spacing.xl, paddingBottom: spacing.md },
  backButton: { alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.md },
  backButtonText: { color: colors.primary, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, marginBottom: spacing.lg },
  profileHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  profileText: { flex: 1 },
  avatar: { width: 72, height: 72, borderRadius: 16, backgroundColor: "#CFFAFE", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarText: { color: "#0E7490", fontSize: 20, fontWeight: "900" },
  avatarImage: { ...StyleSheet.absoluteFillObject },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: spacing.sm },
  identifier: { color: "#0E7490", fontSize: 13, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  primaryButton: { backgroundColor: "#083344", borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  primaryButtonText: { color: colors.surface, fontWeight: "900" },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  info: { minWidth: 220, flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: spacing.sm },
  infoValue: { color: colors.text, fontSize: 15, fontWeight: "800", lineHeight: 21 },
  sessionRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  historyRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  sessionTitle: { color: colors.text, fontWeight: "900", marginBottom: 4 },
  sessionMeta: { color: colors.textMuted },
  mutedText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  errorText: { color: colors.danger, marginBottom: spacing.md },
});
