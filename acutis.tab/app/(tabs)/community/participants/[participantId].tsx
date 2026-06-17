import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatSession(value: string) {
  return new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
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

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href="/(tabs)/community" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("community.backToCommunity", "Back to Community")}</Text>
        </Pressable>
      </Link>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.title}>{participant?.displayName ?? participantId}</Text>
        <Text style={styles.subtitle}>{participant?.referralSource || t("community.communityReferral", "Community referral")}</Text>
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
        <Text style={styles.sectionTitle}>{t("community.sessions", "Sessions")}</Text>
        {appointments.length === 0 ? (
          <Text style={styles.mutedText}>{t("community.noParticipantSessions", "No sessions returned for this service user.")}</Text>
        ) : (
          appointments.map((appointment) => <SessionRow key={appointment.id} appointment={appointment} />)
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("community.latestAssessment", "Latest Assessment")}</Text>
        {latestAssessment ? (
          <View style={styles.grid}>
            <Info label={t("community.assessmentType", "Type")} value={latestAssessment.assessmentType} />
            <Info label={t("community.completed", "Completed")} value={formatDate(latestAssessment.completedAtUtc)} />
            <Info label={t("community.outcome", "Outcome")} value={latestAssessment.outcome} />
            <Info label={t("community.riskSummary", "Risk Summary")} value={latestAssessment.riskSummary} />
          </View>
        ) : (
          <Text style={styles.mutedText}>{t("community.noAssessment", "No assessment has been returned by the API.")}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  backButton: { alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.md },
  backButtonText: { color: colors.primary, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  info: { minWidth: 220, flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: spacing.sm },
  infoValue: { color: colors.text, fontSize: 15, fontWeight: "800", lineHeight: 21 },
  sessionRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  sessionTitle: { color: colors.text, fontWeight: "900", marginBottom: 4 },
  sessionMeta: { color: colors.textMuted },
  mutedText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  errorText: { color: colors.danger, marginBottom: spacing.md },
});
