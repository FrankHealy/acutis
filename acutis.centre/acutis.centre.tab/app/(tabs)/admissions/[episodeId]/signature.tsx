import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { t } from "../../../../src/i18n";
import { SignaturePad, type SignatureStroke } from "../../../../src/features/admissions/captureInputs";

type RouteParams = {
  episodeId?: string | string[];
  resident?: string | string[];
  unit?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AdmissionSignatureScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const episodeId = takeFirst(params.episodeId) ?? "new";
  const resident = takeFirst(params.resident) ?? t("admissions.detox.draftResident", "New Detox Admission");
  const unit = takeFirst(params.unit) ?? "detox";
  const [signatureStrokes, setSignatureStrokes] = useState<SignatureStroke[]>([]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link
        href={{
          pathname: "/(tabs)/admissions/[episodeId]",
          params: { episodeId, resident, unit },
        }}
        asChild
      >
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("admissions.detox.workflowTitle", "Admission Workflow")}</Text>
        </Pressable>
      </Link>

      <View style={styles.card}>
        <Text style={styles.title}>{t("admissions.detox.signatureTitle", "Admission Signature")}</Text>
        <Text style={styles.subtitle}>{t("admissions.detox.signatureSubtitle", "Capture consent and admission signoff here.")}</Text>
        <Text style={styles.resident}>{resident}</Text>

        <SignaturePad strokes={signatureStrokes} onChange={setSignatureStrokes} />
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
    marginBottom: 12,
  },
  resident: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  placeholderPanel: {
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
});
