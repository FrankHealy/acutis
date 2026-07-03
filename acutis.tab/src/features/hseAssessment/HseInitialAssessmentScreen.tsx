import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { DictationNotes, SignaturePad, type SignatureStroke } from "../admissions/captureInputs";
import { saveAdmissionDraft, saveAdmissionSignature } from "../admissions/repository";
import { HSE_INITIAL_ASSESSMENT_FORM } from "./definition";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type RouteParams = { participantId?: string | string[]; resident?: string | string[] };

const FORM_DEFINITION_ID = "6d433f0d-7701-49db-adc4-71fb6557f6a6";
const SERVICE_USER_SIGNATURE_FIELD =
  "assessment_form.consent_and_sign_offs.general_service_user_consent.service_user_signature";
const STAFF_SIGNATURE_FIELD =
  "assessment_form.consent_and_sign_offs.general_service_user_consent.staff_signature";
const SINGLE_CHOICE_FIELDS = new Set([
  "assessment_form.demographics_and_identity.gender_identity.selected_values",
  "assessment_form.demographics_and_identity.sexual_orientation.selected_values",
  "assessment_form.demographics_and_identity.language.uses_other_language_at_home.selected_values",
]);
const PRESENTATION_LABELS: Record<string, string> = {
  "assessment_form.demographics_and_identity.gender_identity.selected_values": "Gender identity",
  "assessment_form.demographics_and_identity.sexual_orientation.selected_values": "Sexual orientation",
  "assessment_form.demographics_and_identity.background.country_of_birth": "Country of birth",
  "assessment_form.demographics_and_identity.language.uses_other_language_at_home.selected_values": "Language other than English or Irish at Home",
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isEmpty(value: JsonValue | undefined) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function getSectionForField(fieldKey: string) {
  return HSE_INITIAL_ASSESSMENT_FORM.ui.sections.find((section) =>
    section.items.includes(fieldKey) || (section.groups ?? []).some((group) => group.items.includes(fieldKey))
  )?.titleKey ?? "HSE Initial Assessment";
}

function guessSignerRole(fieldKey: string): "staff" | "service_user" {
  return /staff|assessor|witness|case_manager/i.test(fieldKey) ? "staff" : "service_user";
}

export default function HseInitialAssessmentScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const participantId = takeFirst(params.participantId) ?? "new";
  const residentName = takeFirst(params.resident) ?? "Community Service User";
  const draftId = `community-initial-assessment-${participantId}`;
  const [answers, setAnswers] = useState<Record<string, JsonValue>>({});
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [signatureStrokes, setSignatureStrokes] = useState<Record<string, SignatureStroke[]>>({});
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Administrative Details"]);

  const validationErrors = useMemo(
    () => HSE_INITIAL_ASSESSMENT_FORM.schema.required.filter((fieldKey) => isEmpty(answers[fieldKey])),
    [answers]
  );

  const setAnswer = (fieldKey: string, value: JsonValue) => {
    setAnswers((current) => ({ ...current, [fieldKey]: value }));
  };

  const toggleMultiValue = (fieldKey: string, value: string) => {
    setAnswers((current) => {
      const existing = Array.isArray(current[fieldKey]) ? current[fieldKey] as JsonValue[] : [];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      return { ...current, [fieldKey]: next };
    });
  };

  const saveAssessment = async (status: "in_progress" | "submitted") => {
    if (status === "submitted" && validationErrors.length > 0) {
      Alert.alert("Required fields", `Complete ${validationErrors.length} required field(s) before submitting.`);
      return;
    }

    setSaving(true);
    try {
      const boundedAnswers = {
        ...answers,
        ...Object.fromEntries(
          Object.entries(signatureStrokes)
            .filter(([, strokes]) => strokes.length > 0)
            .map(([fieldKey, strokes]) => [fieldKey, JSON.stringify({ strokes })])
        ),
      };

      const draft = await saveAdmissionDraft({
        id: draftId,
        unitId: "community",
        residentName,
        status: status === "submitted" ? "ready_to_submit" : "draft",
        payload: {
          initialAssessment: {
            formDefinitionId: FORM_DEFINITION_ID,
            formCode: HSE_INITIAL_ASSESSMENT_FORM.code,
            formVersion: HSE_INITIAL_ASSESSMENT_FORM.version,
            participantId,
            unit: "community",
            module: "community",
            context: "initial_assessment",
            assessmentStatus: status,
            boundedAnswers,
            transcriptAuditMetadata: Object.entries(transcripts).map(([sectionKey, transcript]) => ({
              sectionKey,
              capturedAtClient: new Date().toISOString(),
              transcriptLength: transcript.length,
            })),
            completedBy: status === "submitted" ? "tablet-user" : null,
            completedAt: status === "submitted" ? new Date().toISOString() : null,
          },
        },
      });

      for (const [fieldKey, strokes] of Object.entries(signatureStrokes)) {
        if (strokes.length === 0) continue;
        await saveAdmissionSignature({
          draftId: draft.id,
          signerRole: guessSignerRole(fieldKey),
          signerName: residentName,
          formCode: HSE_INITIAL_ASSESSMENT_FORM.code,
          formVersion: HSE_INITIAL_ASSESSMENT_FORM.version,
          sectionKey: getSectionForField(fieldKey),
          fieldKey,
          signaturePayload: { strokes },
        });
      }

      Alert.alert("Saved", status === "submitted" ? "Initial assessment is ready to submit." : "Draft saved on this tablet.");
    } catch (error) {
      Alert.alert("Could not save", (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (fieldKey: string) => {
    const property = HSE_INITIAL_ASSESSMENT_FORM.schema.properties[fieldKey];
    const widget = HSE_INITIAL_ASSESSMENT_FORM.ui.widgets[fieldKey];
    const label = PRESENTATION_LABELS[fieldKey] ?? HSE_INITIAL_ASSESSMENT_FORM.ui.labelKeys[fieldKey] ?? fieldKey;
    const options = HSE_INITIAL_ASSESSMENT_FORM.ui.selectOptions?.[fieldKey] ?? [];
    const value = answers[fieldKey];
    const required = HSE_INITIAL_ASSESSMENT_FORM.schema.required.includes(fieldKey);
    const hasRequiredError = required && isEmpty(value);

    if (widget === "signature") {
      return (
        <View key={fieldKey} style={[styles.field, hasRequiredError ? styles.fieldError : null]}>
          <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
          <SignaturePad
            strokes={signatureStrokes[fieldKey] ?? []}
            onChange={(strokes) => {
              setSignatureStrokes((current) => ({ ...current, [fieldKey]: strokes }));
              setAnswer(fieldKey, strokes.length > 0 ? "captured" : "");
            }}
          />
        </View>
      );
    }

    if (property.type === "boolean" || widget === "toggle") {
      return (
        <Pressable key={fieldKey} style={styles.booleanField} onPress={() => setAnswer(fieldKey, value !== true)}>
          <View style={[styles.checkbox, value === true ? styles.checkboxChecked : null]} />
          <Text style={styles.booleanLabel}>{label}{required ? " *" : ""}</Text>
        </Pressable>
      );
    }

    if (property.type === "enum" || SINGLE_CHOICE_FIELDS.has(fieldKey)) {
      return (
        <View key={fieldKey} style={[styles.field, hasRequiredError ? styles.fieldError : null]}>
          <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
          <View style={styles.optionWrap}>
            {options.map((option) => (
              <Pressable key={option.value} style={[styles.option, value === option.value ? styles.optionSelected : null]} onPress={() => setAnswer(fieldKey, option.value)}>
                <Text style={[styles.optionText, value === option.value ? styles.optionTextSelected : null]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    if (property.type === "multiEnum") {
      const selected = Array.isArray(value) ? value : [];
      return (
        <View key={fieldKey} style={styles.field}>
          <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
          <View style={styles.optionWrap}>
            {options.map((option) => (
              <Pressable key={option.value} style={[styles.option, selected.includes(option.value) ? styles.optionSelected : null]} onPress={() => toggleMultiValue(fieldKey, option.value)}>
                <Text style={[styles.optionText, selected.includes(option.value) ? styles.optionTextSelected : null]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View key={fieldKey} style={[styles.field, hasRequiredError ? styles.fieldError : null]}>
        <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
        <TextInput
          style={[styles.input, widget === "textarea" || property.type === "text" ? styles.textarea : null]}
          value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
          keyboardType={property.type === "integer" || property.type === "number" ? "numeric" : "default"}
          multiline={widget === "textarea" || property.type === "text"}
          onChangeText={(text) => {
            if (property.type === "integer") {
              setAnswer(fieldKey, text.trim() ? Number.parseInt(text, 10) : null);
            } else if (property.type === "number") {
              setAnswer(fieldKey, text.trim() ? Number.parseFloat(text) : null);
            } else {
              setAnswer(fieldKey, text);
            }
          }}
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screen} stickyHeaderIndices={[0]}>
      <View style={styles.stickyHeader}>
        <Text style={styles.screenTitle}>Community Initial Assessment</Text>
        <Text style={styles.screenMeta}>{HSE_INITIAL_ASSESSMENT_FORM.code} v{HSE_INITIAL_ASSESSMENT_FORM.version}</Text>
      </View>

      {HSE_INITIAL_ASSESSMENT_FORM.ui.sections.filter((section) => section.titleKey !== "Metadata").map((section) => (
        <View key={section.titleKey} style={styles.section}>
          <Pressable style={styles.sectionHeader} onPress={() => setExpandedSections((current) => current.includes(section.titleKey) ? current.filter((key) => key !== section.titleKey) : [...current, section.titleKey])}>
            <Text style={styles.sectionTitle}>{section.titleKey}</Text>
            <Text style={styles.sectionToggle}>{expandedSections.includes(section.titleKey) ? "-" : "+"}</Text>
          </Pressable>
          {expandedSections.includes(section.titleKey) ? <>
            <DictationNotes
              value={transcripts[section.titleKey] ?? ""}
              onChange={(value) => setTranscripts((current) => ({ ...current, [section.titleKey]: value }))}
              title="Dictation"
              placeholder={`Type or dictate notes for ${section.titleKey.toLowerCase()}.`}
            />
            {section.items.map(renderField)}
            {(section.groups ?? []).map((group) => (
              <View key={`${section.titleKey}-${group.title ?? group.titleKey}`} style={styles.group}>
                <Text style={styles.groupTitle}>{group.title === "Children Status" ? "Children" : group.title ?? group.titleKey}</Text>
                <View style={section.titleKey === "Administrative Details" ? styles.twoColumnFields : undefined}>
                  {group.items.map(renderField)}
                </View>
              </View>
            ))}
          </> : null}
        </View>
      ))}

      <View style={styles.actions}>
        <Pressable disabled={saving} style={styles.secondaryButton} onPress={() => void saveAssessment("in_progress")}>
          <Text style={styles.secondaryButtonText}>{saving ? "Saving..." : "Save Draft"}</Text>
        </Pressable>
        <Pressable disabled={saving} style={styles.primaryButton} onPress={() => void saveAssessment("submitted")}>
          <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Confirm Assessment"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 20, backgroundColor: "#F4F8FF" },
  stickyHeader: { backgroundColor: "#F4F8FF", paddingTop: 20, paddingBottom: 12 },
  screenTitle: { fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 2 },
  screenMeta: { color: "#64748B", fontSize: 12, fontWeight: "700", marginBottom: 12 },
  section: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#D7E3F6", padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionToggle: { fontSize: 22, fontWeight: "800", color: "#2563EB", marginBottom: 12 },
  group: { borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 14, marginTop: 14 },
  groupTitle: { fontSize: 13, fontWeight: "900", color: "#475569", textTransform: "uppercase", marginBottom: 10 },
  field: { marginBottom: 12 },
  twoColumnFields: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  fieldError: { borderLeftWidth: 3, borderLeftColor: "#DC2626", paddingLeft: 8 },
  label: { fontSize: 13, color: "#334155", fontWeight: "800", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF", color: "#0F172A" },
  textarea: { minHeight: 92, textAlignVertical: "top" },
  booleanField: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#94A3B8" },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  booleanLabel: { flex: 1, color: "#334155", fontWeight: "700" },
  optionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#FFFFFF" },
  optionSelected: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  optionText: { color: "#334155", fontWeight: "700" },
  optionTextSelected: { color: "#1D4ED8" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "flex-end", marginBottom: 24 },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  secondaryButton: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#D7E3F6", paddingHorizontal: 16, paddingVertical: 12 },
  secondaryButtonText: { color: "#1D4ED8", fontSize: 14, fontWeight: "900" },
});
