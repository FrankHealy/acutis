import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getApiBaseUrl } from "../../src/constants/runtimeConfig";
import { getOfflinePolicyStatus, OfflinePolicyStatus } from "../../src/services/api/bootstrap";

export default function DashboardScreen() {
  const router = useRouter();
  const [policy, setPolicy] = useState<OfflinePolicyStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getOfflinePolicyStatus()
      .then((result) => {
        if (!isActive) {
          return;
        }
        setPolicy(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isActive) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load bootstrap data");
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "600", marginBottom: 12 }}>Acutis Tablet</Text>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Hello Frank - Boo Hoo</Text>
      <Text style={{ textAlign: "center", marginBottom: 16 }}>API: {getApiBaseUrl() || "not configured"}</Text>

      <Pressable
        onPress={() => router.push("/(tabs)/roll-call")}
        style={{ backgroundColor: "#2563EB", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, marginBottom: 16 }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Open Roll Call</Text>
      </Pressable>

      {!policy && !error ? (
        <>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 8 }}>Loading bootstrap from acutis.api...</Text>
        </>
      ) : null}

      {policy ? (
        <View style={{ alignItems: "center" }}>
          <Text>Time zone: {policy.timeZone}</Text>
          <Text>Server local time: {policy.localTime}</Text>
          <Text>Morning window: {policy.isInMorningWindow ? "Open" : "Closed"}</Text>
          <Text>Evening window: {policy.isInEveningWindow ? "Open" : "Closed"}</Text>
          <Text>Token validity: {policy.tokenValidityMinutes} minutes</Text>
        </View>
      ) : null}

      {error ? (
        <Text style={{ color: "red", textAlign: "center" }}>Bootstrap error: {error}</Text>
      ) : null}
    </View>
  );
}
