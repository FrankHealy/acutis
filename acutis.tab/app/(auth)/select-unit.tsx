import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ROLL_CALL_UNITS } from "../../src/features/rollCall/units";
import { t } from "../../src/i18n";
import { colors, spacing } from "../../src/theme/tokens";

export default function SelectUnitScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("auth.selectUnit", "Select Unit")}</Text>
        <Text style={styles.subtitle}>{t("auth.selectUnitSubtitle", "Choose the operational unit for this tablet session.")}</Text>
      </View>
      {ROLL_CALL_UNITS.map((unit) => (
        <Link key={unit.id} href={`/(tabs)/unit/${unit.id}` as never} asChild>
          <Pressable style={styles.unitRow}>
            <View style={[styles.marker, { backgroundColor: unit.accentColor }]} />
            <View>
              <Text style={styles.unitName}>{unit.name}</Text>
              <Text style={styles.unitDescription}>{unit.description}</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
  },
  unitRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  marker: {
    width: 12,
    height: 48,
    borderRadius: 999,
  },
  unitName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  unitDescription: {
    color: colors.textMuted,
    marginTop: 4,
  },
});
