import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../../src/i18n";
import { DictationNotes, PhotoCapture, SignaturePad, type SignatureStroke } from "../../../src/features/admissions/captureInputs";
import { saveAdmissionDraft, saveAdmissionSignature } from "../../../src/features/admissions/repository";

type RouteParams = {
  episodeId?: string | string[];
  unit?: string | string[];
  resident?: string | string[];
  status?: string | string[];
  phone?: string | string[];
  queueType?: string | string[];
  completedAt?: string | string[];
};

type AdmissionSectionCard = {
  key: string;
  title: string;
};

const SECTION_CARDS: AdmissionSectionCard[] = [
  { key: "arrival", title: t("admissions.detox.sections.arrival", "Arrival Check-In") },
  { key: "assessment", title: t("admissions.detox.sections.assessment", "Clinical Assessment") },
  { key: "belongings", title: t("admissions.detox.sections.belongings", "Belongings / Search") },
  { key: "room", title: t("admissions.detox.sections.room", "Room Allocation") },
  { key: "consent", title: t("admissions.detox.sections.consent", "Consent & Signoff") },
];

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AdmissionEpisodeScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const router = useRouter();
  const episodeId = takeFirst(params.episodeId) ?? "new";
  const unit = takeFirst(params.unit) ?? "detox";
  const isCommunity = unit === "community";
  const isDraft = episodeId === "new";
  const resident = takeFirst(params.resident) ?? (
    isCommunity
      ? t("admissions.community.draftResident", "New Community Admission")
      : t("admissions.detox.draftResident", "New Detox Admission")
  );
  const status = takeFirst(params.status) ?? t("admissions.detox.statusDraft", "Draft");
  const phone = takeFirst(params.phone) ?? "Not supplied";
  const queueType = takeFirst(params.queueType) ?? "Manual";
  const completedAtRaw = takeFirst(params.completedAt);
  const completedAt = completedAtRaw
    ? new Date(completedAtRaw).toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [signatureStrokes, setSignatureStrokes] = useState<SignatureStroke[]>([]);
  const [saving, setSaving] = useState(false);
  const admissionTitle = isCommunity
    ? t("admissions.community.title", "Community Admissions")
    : t("admissions.detox.title", "Detox Admissions");
  const unitName = isCommunity ? t("community.unitName", "Community") : t("units.detox.name", "Detox");

  const saveFirstPage = async () => {
    setSaving(true);
    try {
      const draft = await saveAdmissionDraft({
        id: isDraft ? undefined : episodeId,
        unitId: unit,
        residentName: resident,
        payload: {
          firstPage: {
            notes,
            photoUri,
            hasSignature: signatureStrokes.length > 0,
            source: queueType,
            phone,
            completedAt,
          },
        },
      });

      if (signatureStrokes.length > 0) {
        await saveAdmissionSignature({
          draftId: draft.id,
          signerRole: "service_user",
          signerName: resident,
          signaturePayload: { strokes: signatureStrokes },
        });
      }

      if (isDraft) {
        router.replace({
          pathname: "/(tabs)/admissions/[episodeId]",
          params: { episodeId: draft.id, unit, resident, status, phone, queueType, completedAt: completedAtRaw ?? "" },
        });
      }

      Alert.alert(t("admissions.capture.savedTitle", "Admission Saved"), t("admissions.capture.savedMessage", "First-page capture has been saved on this tablet."));
    } catch (error) {
      Alert.alert(t("admissions.capture.saveFailedTitle", "Could not save"), (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={{ pathname: "/(tabs)/admissions", params: { unit } }} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{admissionTitle}</Text>
        </Pressable>
      </Link>

      <View style={styles.headerCard}>
        <Text style={styles.title}>{resident}</Text>
        <Text style={styles.subtitle}>{t("admissions.detox.workflowSubtitle", "Work through the core Detox admission sections in order.")}</Text>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <Text style={styles.caseReference}>{isDraft ? "Draft workflow" : `Case ${episodeId}`}</Text>
        </View>

        {isDraft ? <Text style={styles.draftNote}>{t("admissions.detox.createModeNote", "This is a local draft workflow only. It does not save to the API yet.")}</Text> : null}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>{t("admissions.detox.residentDetails", "Resident Details")}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("admissions.detox.phone", "Phone")}</Text>
          <Text style={styles.infoValue}>{phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("admissions.detox.source", "Source")}</Text>
          <Text style={styles.infoValue}>{queueType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("admissions.detox.completedAt", "Completed")}</Text>
          <Text style={styles.infoValue}>{completedAt}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.captureIntro}>
          <View>
            <Text style={styles.sectionTitle}>{t("admissions.capture.firstPageTitle", "First Page Capture")}</Text>
            <Text style={styles.captureSubtitle}>{unitName}</Text>
          </View>
          <Pressable disabled={saving} style={[styles.primaryButton, saving ? styles.disabledButton : null]} onPress={() => void saveFirstPage()}>
            <Text style={styles.primaryButtonText}>
              {saving ? t("admissions.capture.saving", "Saving...") : t("admissions.capture.save", "Save Capture")}
            </Text>
          </Pressable>
        </View>
        <DictationNotes value={notes} onChange={setNotes} />
        <PhotoCapture uri={photoUri} onChange={setPhotoUri} />
        <SignaturePad strokes={signatureStrokes} onChange={setSignatureStrokes} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>{t("admissions.detox.workflowTitle", "Admission Workflow")}</Text>
        {SECTION_CARDS.map((section) => (
          <Link
            key={section.key}
            href={{
              pathname: "/(tabs)/admissions/[episodeId]/sections/[sectionKey]",
              params: {
                episodeId,
                sectionKey: section.key,
                resident,
                unit,
              },
            }}
            asChild
          >
            <Pressable style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionRowTitle}>{section.title}</Text>
                <Text style={styles.sectionRowState}>{t("admissions.detox.sectionStatusReady", "Ready to complete")}</Text>
              </View>
              <Text style={styles.sectionRowArrow}>›</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>{t("admissions.detox.nextActions", "Next Actions")}</Text>
        <View style={styles.actionRow}>
          <Link
            href={{
              pathname: "/(tabs)/admissions/[episodeId]/review",
              params: { episodeId, resident, unit },
            }}
            asChild
          >
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t("admissions.detox.viewReview", "Review")}</Text>
            </Pressable>
          </Link>

          <Link
            href={{
              pathname: "/(tabs)/admissions/[episodeId]/signature",
              params: { episodeId, resident, unit },
            }}
            asChild
          >
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t("admissions.detox.captureSignature", "Signature")}</Text>
            </Pressable>
          </Link>
        </View>
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
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  statusPill: {
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  caseReference: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  draftNote: {
    fontSize: 13,
    lineHeight: 18,
    color: "#B45309",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
    marginBottom: 16,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  captureIntro: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  captureSubtitle: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2FF",
  },
  sectionRowTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  sectionRowState: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  sectionRowArrow: {
    fontSize: 24,
    color: "#94A3B8",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "800",
  },
});
