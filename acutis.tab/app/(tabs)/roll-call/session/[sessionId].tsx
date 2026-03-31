import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RouteParams = {
  sessionId?: string | string[];
};

export default function RollCallSessionScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roll Call Session</Text>
      <Text style={styles.subtitle}>{sessionId ?? "No session id provided"}</Text>
      <Text style={styles.body}>Session detail can be expanded here later for review and sync history.</Text>

      <Link href="/(tabs)/roll-call" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Back to roll call</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F7FB",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 8,
  },
  body: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});