import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getRollCallDateLabel,
  getRollCallWindowLabel,
  ROLL_CALL_UNITS,
} from "../../../src/features/rollCall/units";

export default function RollCallHomeScreen() {
  const router = useRouter();
  const dateLabel = getRollCallDateLabel();
  const windowLabel = getRollCallWindowLabel();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Roll Call</Text>
      <Text style={styles.subtitle}>{dateLabel} · {windowLabel} round</Text>
      <Text style={styles.intro}>
        Choose a unit to open the live resident roster from `acutis.api` and mark attendance incrementally.
      </Text>

      {ROLL_CALL_UNITS.map((unit) => (
        <Pressable
          key={unit.id}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/roll-call/[unitId]",
              params: { unitId: unit.id },
            })
          }
          style={[styles.card, { backgroundColor: unit.surfaceColor }]}
        >
          <View style={[styles.accentBar, { backgroundColor: unit.accentColor }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{unit.name} Unit</Text>
            <Text style={styles.cardDescription}>{unit.description}</Text>
            <Text style={[styles.cardBadge, { color: unit.accentColor }]}>Start {windowLabel} roll call</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F7FB",
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
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
});
