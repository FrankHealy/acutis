import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { fetchDetoxSchedulingBoard, type ScreeningSchedulingAwaitingItemDto } from "../../../src/features/admissions/api";
import { getAdmissionDraftsForUnit, type AdmissionDraft } from "../../../src/features/admissions/repository";
import { t } from "../../../src/i18n";

type RouteParams = {
  unit?: string | string[];
};

type QueueItem = {
  id: string;
  resident: string;
  eta: string;
  statusKey: "statusWaiting" | "statusReview" | "statusReady";
  accent: string;
  note: string;
  phoneNumber: string;
  queueType: string;
  completedAt: string;
};

type StepItem = {
  id: string;
  title: string;
  description: string;
};

const FALLBACK_QUEUE: QueueItem[] = [
  {
    id: "detox-adm-001",
    resident: "E.M.",
    eta: "10:30",
    statusKey: "statusReview",
    accent: "#F59E0B",
    note: "Clinical notes received, bed hold pending final check.",
    phoneNumber: "",
    queueType: "Referral",
    completedAt: "",
  },
  {
    id: "detox-adm-002",
    resident: "K.R.",
    eta: "12:15",
    statusKey: "statusWaiting",
    accent: "#2563EB",
    note: "Expected from referral team, transport confirmation outstanding.",
    phoneNumber: "",
    queueType: "Referral",
    completedAt: "",
  },
  {
    id: "detox-adm-003",
    resident: "P.D.",
    eta: "14:00",
    statusKey: "statusReady",
    accent: "#16A34A",
    note: "Room prepared and intake pack assembled.",
    phoneNumber: "",
    queueType: "Referral",
    completedAt: "",
  },
];

const DETOX_STEPS: StepItem[] = [
  {
    id: "arrival",
    title: t("admissions.detox.sections.arrival", "Arrival Check-In"),
    description: t("admissions.detox.sectionDescriptions.arrival", "Confirm arrival time, referral source and escort details."),
  },
  {
    id: "assessment",
    title: t("admissions.detox.sections.assessment", "Clinical Assessment"),
    description: t("admissions.detox.sectionDescriptions.assessment", "Record presenting condition, withdrawal risk and immediate observations."),
  },
  {
    id: "belongings",
    title: t("admissions.detox.sections.belongings", "Belongings / Search"),
    description: t("admissions.detox.sectionDescriptions.belongings", "Log valuables, complete search record and note restricted items."),
  },
  {
    id: "room",
    title: t("admissions.detox.sections.room", "Room Allocation"),
    description: t("admissions.detox.sectionDescriptions.room", "Assign bed space, confirm roundel availability and hand over room rules."),
  },
  {
    id: "consent",
    title: t("admissions.detox.sections.consent", "Consent & Signoff"),
    description: t("admissions.detox.sectionDescriptions.consent", "Capture signatures and complete the initial admission checklist."),
  },
];

function toQueueItem(item: ScreeningSchedulingAwaitingItemDto): QueueItem {
  const resident = `${item.name} ${item.surname}`.trim();
  const completedAt = item.completedAt ? new Date(item.completedAt) : null;

  return {
    id: item.caseId,
    resident: resident || "Unknown",
    eta: completedAt
      ? completedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "--:--",
    statusKey: "statusWaiting",
    accent: "#2563EB",
    note: `${item.queueType} completed and awaiting scheduling.`,
    phoneNumber: item.phoneNumber,
    queueType: item.queueType,
    completedAt: item.completedAt,
  };
}

function draftToQueueItem(item: AdmissionDraft): QueueItem {
  return {
    id: item.id,
    resident: item.residentName,
    eta: new Date(item.updatedAtClient).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    statusKey: item.status === "ready_to_submit" ? "statusReady" : "statusReview",
    accent: item.status === "ready_to_submit" ? "#16A34A" : "#0E7490",
    note: t("admissions.community.localDraftNote", "Saved locally on this tablet."),
    phoneNumber: "",
    queueType: t("admissions.community.localDraft", "Local draft"),
    completedAt: item.updatedAtClient,
  };
}

export default function AdmissionsIndexScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const rawUnit = Array.isArray(params.unit) ? params.unit[0] : params.unit;
  const unit = rawUnit ?? "detox";
  const isCommunity = unit === "community";
  const isDetox = unit === "detox";
  const title = isCommunity ? t("admissions.community.title", "Community Admissions") : t("admissions.detox.title", "Detox Admissions");
  const subtitle = isCommunity
    ? t("admissions.community.subtitle", "Start Community service-user admissions and capture first-page consent.")
    : t("admissions.detox.subtitle", "Track arrivals, room readiness and the current intake queue.");
  const unitName = isCommunity ? t("community.unitName", "Community") : t("units.detox.name", "Detox");

  const [queueItems, setQueueItems] = useState<QueueItem[]>(FALLBACK_QUEUE);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [slotCount, setSlotCount] = useState(0);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!isDetox) {
      getAdmissionDraftsForUnit(unit)
        .then((drafts) => {
          if (cancelled) return;
          setQueueItems(drafts.map(draftToQueueItem));
          setScheduledCount(0);
          setSlotCount(0);
          setIsUsingFallback(false);
        })
        .catch(() => {
          if (cancelled) return;
          setQueueItems([]);
          setScheduledCount(0);
          setSlotCount(0);
          setIsUsingFallback(false);
        });
      return;
    }

    fetchDetoxSchedulingBoard()
      .then((board) => {
        if (cancelled) {
          return;
        }

        setQueueItems(board.awaiting.map(toQueueItem));
        setScheduledCount(board.slots.reduce((sum, slot) => sum + slot.assignmentCount, 0));
        setSlotCount(board.slots.length);
        setIsUsingFallback(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setQueueItems(FALLBACK_QUEUE);
        setScheduledCount(0);
        setSlotCount(0);
        setIsUsingFallback(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isDetox, unit]);

  const roomReadyCount = useMemo(
    () => queueItems.filter((item) => item.statusKey === "statusReady").length,
    [queueItems],
  );

  if (!isDetox && !isCommunity) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>{t("admissions.detox.emptyTitle", "Admissions not available")}</Text>
        <Text style={styles.emptyText}>{t("admissions.detox.emptyText", "This admissions view is currently prepared for Detox only.")}</Text>
        <Link href="/(tabs)/dashboard" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>{t("admissions.detox.backToDashboard", "Back to dashboard")}</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={isCommunity ? "/(tabs)/community" : "/(tabs)/unit/detox"} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>
            {isCommunity ? t("community.backToCommunity", "Back to Community") : t("admissions.detox.backToDetox", "Back to Detox")}
          </Text>
        </Pressable>
      </Link>

      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.unitPill}>
            <Text style={styles.unitPillLabel}>{t("admissions.detox.currentUnitLabel", "Current Unit")}</Text>
            <Text style={styles.unitPillValue}>{unitName}</Text>
          </View>
        </View>

        <Link href={{ pathname: "/(tabs)/admissions/[episodeId]", params: { episodeId: "new", unit } }} asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t("admissions.detox.startAdmission", "Start Admission")}</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{isCommunity ? t("admissions.community.localDrafts", "Local Drafts") : t("admissions.detox.awaitingCount", "Awaiting Scheduling")}</Text>
          <Text style={styles.metricValue}>{queueItems.length}</Text>
        </View>
        {isDetox ? (
          <>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("admissions.detox.scheduledCount", "Scheduled")}</Text>
              <Text style={[styles.metricValue, { color: "#2563EB" }]}>{scheduledCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("admissions.detox.slotCount", "Upcoming Dates")}</Text>
              <Text style={[styles.metricValue, { color: "#16A34A" }]}>{slotCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("admissions.detox.roomReady", "Rooms Ready")}</Text>
              <Text style={[styles.metricValue, { color: "#16A34A" }]}>{roomReadyCount}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{isCommunity ? t("admissions.community.queueTitle", "Community Admission Drafts") : t("admissions.detox.queueTitle", "Admissions Queue")}</Text>
          {!isCommunity ? (
            <View style={[styles.liveBadge, isUsingFallback ? styles.liveBadgeFallback : styles.liveBadgeLive]}>
              <Text style={[styles.liveBadgeText, isUsingFallback ? styles.liveBadgeTextFallback : styles.liveBadgeTextLive]}>
                {isUsingFallback ? t("admissions.detox.fallbackQueue", "Fallback queue") : t("admissions.detox.liveQueue", "Live queue")}
              </Text>
            </View>
          ) : (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeTextFallback}>{t("admissions.community.localOnly", "Local first-page capture")}</Text>
            </View>
          )}
        </View>

        {isUsingFallback && !isCommunity ? (
          <Text style={styles.noticeText}>
            {t("admissions.detox.queueUnavailable", "Live admissions data is unavailable, so this screen is showing fallback tablet data.")}
          </Text>
        ) : null}

        {queueItems.length === 0 ? (
          <Text style={styles.emptyQueueText}>
            {isCommunity
              ? t("admissions.community.queueEmpty", "Start a new admission to capture first-page details, notes, photo and signature.")
              : t("admissions.detox.queueEmpty", "No admissions are currently awaiting scheduling.")}
          </Text>
        ) : null}

        {queueItems.map((item) => (
          <Link
            key={item.id}
            href={{
              pathname: "/(tabs)/admissions/[episodeId]",
              params: {
                episodeId: item.id,
                unit,
                resident: item.resident,
                status: t(`admissions.detox.${item.statusKey}`),
                phone: item.phoneNumber,
                queueType: item.queueType,
                completedAt: item.completedAt,
              },
            }}
            asChild
          >
            <Pressable style={styles.queueRow}>
              <View style={[styles.queueMarker, { backgroundColor: item.accent }]} />

              <View style={styles.queueMain}>
                <View style={styles.queueHead}>
                  <Text style={styles.queueResident}>{item.resident}</Text>
                  <Text style={styles.queueEta}>{item.eta}</Text>
                </View>
                <Text style={styles.queueNote}>{item.note}</Text>
              </View>

              <View style={[styles.statusPill, { backgroundColor: `${item.accent}18` }]}>
                <Text style={[styles.statusText, { color: item.accent }]}>
                  {t(`admissions.detox.${item.statusKey}`)}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{isCommunity ? t("admissions.community.stepsTitle", "Community Intake Steps") : t("admissions.detox.stepsTitle", "Detox Intake Steps")}</Text>
        {DETOX_STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F4F8FF",
  },
  emptyScreen: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F8FF",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  backButtonText: {
    color: "#1D4ED8",
    fontWeight: "800",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    maxWidth: 520,
  },
  unitPill: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 152,
  },
  unitPillLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 2,
  },
  unitPillValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2563EB",
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 16,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
    marginBottom: 16,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  liveBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveBadgeLive: {
    backgroundColor: "#ECFDF5",
  },
  liveBadgeFallback: {
    backgroundColor: "#FFF7ED",
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  liveBadgeTextLive: {
    color: "#047857",
  },
  liveBadgeTextFallback: {
    color: "#C2410C",
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#B45309",
    marginBottom: 10,
  },
  emptyQueueText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
  },
  queueMarker: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 6,
  },
  queueMain: {
    flex: 1,
  },
  queueHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  queueResident: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  queueEta: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  queueNote: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563EB",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
});
