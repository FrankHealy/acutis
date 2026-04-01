import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { t } from "../../../../../src/i18n";

type RouteParams = {
  episodeId?: string | string[];
  sectionKey?: string | string[];
  resident?: string | string[];
  unit?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveSectionTitle(sectionKey: string) {
  switch (sectionKey) {
    case "arrival":
      return t("admissions.detox.sections.arrival", "Arrival Check-In");
    case "assessment":
      return t("admissions.detox.sections.assessment", "Clinical Assessment");
    case "belongings":
      return t("admissions.detox.sections.belongings", "Belongings / Search");
    case "room":
      return t("admissions.detox.sections.room", "Room Allocation");
    case "consent":
      return t("admissions.detox.sections.consent", "Consent & Signoff");
    default:
      return sectionKey;
  }
}

export default function AdmissionSectionScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const episodeId = takeFirst(params.episodeId) ?? "new";
  const sectionKey = takeFirst(params.sectionKey) ?? "arrival";
  const resident = takeFirst(params.resident) ?? t("admissions.detox.draftResident", "New Detox Admission");

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link
        href={{
          pathname: "/(tabs)/admissions/[episodeId]",
          params: { episodeId, resident, unit: "detox" },
        }}
        asChild
      >
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("admissions.detox.workflowTitle", "Admission Workflow")}</Text>
        </Pressable>
      </Link>

      <View style={styles.card}>
        <Text style={styles.title}>{resolveSectionTitle(sectionKey)}</Text>
        <Text style={styles.subtitle}>{t("admissions.detox.sectionScreenSubtitle", "This section is scaffolded for the Detox intake flow.")}</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>{t("admissions.detox.residentDetails", "Resident Details")}</Text>
          <Text style={styles.infoValue}>{resident}</Text>
        </View>

        <View style={styles.placeholderPanel}>
          <Text style={styles.placeholderTitle}>{t("admissions.detox.sectionScreenTitle", "Admission Section")}</Text>
          <Text style={styles.placeholderText}>{t("admissions.detox.sectionComingSoon", "Section detail entry is not implemented yet.")}</Text>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
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
    marginBottom: 16,
  },
  infoBlock: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  placeholderPanel: {
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
});
