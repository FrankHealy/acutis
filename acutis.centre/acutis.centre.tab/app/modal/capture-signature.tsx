import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../src/i18n";
import { colors, spacing } from "../../src/theme/tokens";

export default function CaptureSignatureModal() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("admissions.detox.signatureTitle", "Admission Signature")}</Text>
        <Text style={styles.subtitle}>{t("admissions.detox.signatureSubtitle", "Capture consent and admission signoff here.")}</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/(tabs)/admissions/new/signature?unit=detox")}>
          <Text style={styles.buttonText}>{t("admissions.detox.captureSignature", "Signature")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: spacing.xl, backgroundColor: colors.surfaceMuted },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: spacing.sm },
  subtitle: { color: colors.textMuted, marginBottom: spacing.lg },
  button: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  buttonText: { color: colors.surface, fontWeight: "800" },
});
