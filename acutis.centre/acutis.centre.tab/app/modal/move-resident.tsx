import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../src/i18n";
import { colors, spacing } from "../../src/theme/tokens";

export default function MoveResidentModal() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("maps.detox.title", "Detox Room Map")}</Text>
        <Text style={styles.subtitle}>{t("maps.detox.subtitle", "Native tablet version based on the Detox floor plan.")}</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/(tabs)/maps/detox")}>
          <Text style={styles.buttonText}>{t("dashboard.roomMap", "Room Map")}</Text>
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
