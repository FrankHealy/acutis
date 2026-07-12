import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { t } from "../../../../src/i18n";
import { colors, spacing } from "../../../../src/theme/tokens";

type RouteParams = {
  sessionId?: string | string[];
};

function takeFirst(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function GroupTherapyNotesScreen() {
  const sessionId = takeFirst(useLocalSearchParams<RouteParams>().sessionId) ?? "";

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href={{ pathname: "/(tabs)/therapy/[sessionId]", params: { sessionId } }} asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("groupTherapy.continuityTitle", "Continuity")}</Text>
        </Pressable>
      </Link>

      <View style={styles.card}>
        <Text style={styles.title}>{t("groupTherapy.notes", "Notes")}</Text>
        <Text style={styles.subtitle}>{sessionId}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
