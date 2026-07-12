import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getRollCallDateLabel,
  getRollCallWindowLabel,
  getRollCallUnit,
} from "../../../src/features/rollCall/units";

type RollCallUnitId = "alcohol" | "detox";

const DISPLAY_UNITS: RollCallUnitId[] = ["alcohol", "detox"];

export default function RollCallHomeScreen() {
  const router = useRouter();
  const dateLabel = getRollCallDateLabel();
  const windowLabel = getRollCallWindowLabel();
  const openUnit = (unitId: string) => {
    router.push({
      pathname: "/(tabs)/roll-call/[unitId]",
      params: { unitId },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandBar}>
        <Text style={styles.brand}>Acutis</Text>
        <Text style={styles.brandSub}>Tablet Roll Call</Text>
      </View>

      <Text style={styles.title}>Unit picker</Text>
      <Text style={styles.subtitle}>{dateLabel} · {windowLabel} session</Text>
      <Text style={styles.intro}>
        Choose a unit to start attendance tracking. We currently support Alcohol & Gambling and Detox.
      </Text>

      <View style={styles.cardGroup}>
        {DISPLAY_UNITS.map((unitId) => {
          const unit = getRollCallUnit(unitId);
          return (
            <Pressable
              key={unit.id}
              onPress={() => openUnit(unit.id)}
              style={[styles.card, { backgroundColor: unit.surfaceColor }]}
            >
              <View style={[styles.accentBar, { backgroundColor: unit.accentColor }]} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{unit.name}</Text>
                <Text style={styles.cardDescription}>{unit.description}</Text>
                <Text style={[styles.cardBadge, { color: unit.accentColor }]}>Start {unit.name} roll call</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.splitInfo}>
        <Text style={styles.sectionHeading}>Two-unit rollout</Text>
        <Text style={styles.sectionText}>Run Alcohol & Gambling and Detox roll call from the two available cards.</Text>
      </View>

      <Text style={styles.note}>Tablet roll call is currently scoped to the two live residential units.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F7FB",
    flexGrow: 1,
  },
  brandBar: {
    marginBottom: 24,
    alignItems: "center",
  },
  brand: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  brandSub: {
    marginTop: 4,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  cardGroup: {
    width: "100%",
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  accentBar: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 10,
  },
  cardBadge: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  sectionText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
  },
  splitInfo: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});
