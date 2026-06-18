import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../src/i18n";
import { useAuth } from "../../src/services/auth/AuthContext";
import { colors, spacing } from "../../src/theme/tokens";

export default function LoginScreen() {
  const { state, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const signingIn = state === "checking";

  if (state === "authenticated") {
    return <Redirect href="/(tabs)/community" />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{t("auth.loginTitle", "Acutis Tablet")}</Text>
        <Text style={styles.subtitle}>{signingIn ? t("auth.checking", "Opening Keycloak...") : t("auth.loginSubtitle", "Sign in with Keycloak to continue.")}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          disabled={signingIn}
          style={[styles.button, signingIn ? styles.buttonDisabled : null]}
          onPress={() => {
            setError(null);
            void signIn().catch((signInError) => {
              setError(signInError instanceof Error ? signInError.message : "Keycloak sign-in was not completed.");
            });
          }}
        >
          <Text style={styles.buttonText}>{signingIn ? "Opening..." : t("auth.signIn", "Sign in")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    padding: spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: "800",
  },
  error: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
});
