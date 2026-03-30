import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRollCall } from "../../../src/features/rollCall/useRollCall";

const DUMMY_RESIDENTS = [
  { id: "resident-1", name: "Alice" },
  { id: "resident-2", name: "Bob" },
  { id: "resident-3", name: "Carol" },
  { id: "resident-4", name: "David" },
];

const SESSION_ID = "session-1";

export default function RollCallScreen() {
  const { records, loading, error, markAttendance, countStatus } = useRollCall(SESSION_ID);

  const getStatus = (residentId: string) => {
    const record = records.find((item) => item.residentId === residentId);
    return record?.status ?? "unknown";
  };

  const setStatus = async (residentId: string, status: "present" | "absent") => {
    await markAttendance(residentId, status);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roll Call</Text>
      <Text style={styles.subtitle}>Session: {SESSION_ID}</Text>

      <Text style={styles.counter}>present: {countStatus.present} · absent: {countStatus.absent} · unknown: {countStatus.unknown}</Text>

      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={DUMMY_RESIDENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.residentName}>{item.name}</Text>
              <Text style={styles.status}>Status: {getStatus(item.id)}</Text>
            </View>
            <View style={styles.buttons}>
              <Pressable style={styles.present} onPress={() => setStatus(item.id, "present")}> 
                <Text style={styles.buttonText}>Present</Text>
              </Pressable>
              <Pressable style={styles.absent} onPress={() => setStatus(item.id, "absent")}> 
                <Text style={styles.buttonText}>Absent</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 12 },
  counter: { marginBottom: 12, fontSize: 14 },
  error: { color: "red" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  residentName: { fontSize: 18, fontWeight: "600" },
  status: { fontSize: 14, color: "#555" },
  buttons: { flexDirection: "row" },
  present: { backgroundColor: "#0a0", padding: 8, borderRadius: 6, marginRight: 8 },
  absent: { backgroundColor: "#c00", padding: 8, borderRadius: 6 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
