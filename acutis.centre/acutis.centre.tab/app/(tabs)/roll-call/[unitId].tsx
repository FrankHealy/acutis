import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchRollCallResidents, RollCallResident } from "../../../src/features/rollCall/api";
import { AttendanceStatus } from "../../../src/features/rollCall/repository";
import { useRollCall } from "../../../src/features/rollCall/useRollCall";
import {
  buildRollCallSessionId,
  getRollCallDateLabel,
  getRollCallUnit,
  getRollCallWindowLabel,
  isRollCallUnitId,
} from "../../../src/features/rollCall/units";

type RouteParams = {
  unitId?: string | string[];
};

function getInitials(firstName: string, surname: string): string {
  return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

function toStatusLabel(status: AttendanceStatus): string {
  return status === "unknown" ? "Pending" : status === "present" ? "Present" : "Absent";
}

export default function UnitRollCallScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const rawUnitId = Array.isArray(params.unitId) ? params.unitId[0] : params.unitId;

  if (!rawUnitId || !isRollCallUnitId(rawUnitId)) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.invalidTitle}>Unknown unit</Text>
        <Link href="/(tabs)/roll-call" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to units</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const unitId = rawUnitId;
  const unit = getRollCallUnit(unitId);
  const sessionId = useMemo(() => buildRollCallSessionId(unitId), [unitId]);
  const dateLabel = getRollCallDateLabel();
  const windowLabel = getRollCallWindowLabel();

  const { records, loading: localLoading, saving, pendingSyncCount, error: localError, markAttendance, countStatus } =
    useRollCall(sessionId);

  const [residents, setResidents] = useState<RollCallResident[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSavedMessage, setLastSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResidents() {
      try {
        setLoadingResidents(true);
        const data = await fetchRollCallResidents(unitId);
        if (active) {
          setResidents(data);
          setApiError(null);
        }
      } catch (error) {
        if (active) {
          setApiError(error instanceof Error ? error.message : "Failed to load residents from acutis.api");
        }
      } finally {
        if (active) {
          setLoadingResidents(false);
        }
      }
    }

    void loadResidents();

    return () => {
      active = false;
    };
  }, [unitId]);

  const getStatus = (residentId: string): AttendanceStatus => {
    const existing = records.find((record) => record.residentId === residentId);
    return existing?.status ?? "unknown";
  };

  const setStatus = async (residentId: string, status: AttendanceStatus) => {
    await markAttendance(residentId, status);
    setLastSavedMessage(`Saved locally at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  };

  const markAll = async (status: "present" | "absent") => {
    for (const resident of residents) {
      await markAttendance(resident.id, status);
    }

    setLastSavedMessage(`Marked all ${status} and queued for sync`);
  };

  const completedCount = countStatus.present + countStatus.absent;
  const pendingCount = Math.max(residents.length - completedCount, 0);
  const progressPercent = residents.length > 0 ? Math.round((completedCount / residents.length) * 100) : 0;

  return (
    <FlatList
      data={residents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const status = getStatus(item.id);
        return (
          <View style={styles.residentCard}>
            <View style={[styles.avatar, { backgroundColor: unit.surfaceColor }]}> 
              <Text style={[styles.avatarText, { color: unit.accentColor }]}>{getInitials(item.firstName, item.surname)}</Text>
            </View>

            <View style={styles.residentBody}>
              <Text style={styles.residentName}>{item.firstName} {item.surname}</Text>
              <Text style={styles.residentMeta}>Room {item.roomNumber || "-"} · Week {item.weekNumber || 0} · {item.nationality || "Unknown"}</Text>
              <Text style={styles.residentAux}>Programme: {item.programmeType || "Not set"} · Case: {item.caseStatus || "Not set"}</Text>
              <Text style={styles.residentStatus}>Status: {toStatusLabel(status)}</Text>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.statusButton, status === "present" ? styles.presentActive : styles.presentIdle]}
                  onPress={() => void setStatus(item.id, "present")}
                >
                  <Text style={[styles.statusButtonText, status === "present" && styles.statusButtonTextActive]}>Present</Text>
                </Pressable>

                <View style={styles.actionSpacer} />

                <Pressable
                  style={[styles.statusButton, status === "absent" ? styles.absentActive : styles.absentIdle]}
                  onPress={() => void setStatus(item.id, "absent")}
                >
                  <Text style={[styles.statusButtonText, status === "absent" && styles.statusButtonTextActive]}>Absent</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
      ListHeaderComponent={
        <>
          <Link href="/(tabs)/roll-call" asChild>
            <Pressable style={styles.backButton}>
              <Text style={styles.backButtonText}>Back to units</Text>
            </Pressable>
          </Link>

          <View style={styles.headerCard}>
            <Text style={styles.title}>Roll Call - {unit.name} Unit</Text>
            <Text style={styles.subtitle}>{dateLabel} · {windowLabel} roll call · {residents.length} residents</Text>
            <Text style={styles.caption}>Live resident roster from `acutis.api`, with local incremental attendance save.</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: "#15803D" }]}>{countStatus.present}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: "#B91C1C" }]}>{countStatus.absent}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: "#A16207" }]}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>

            <Text style={styles.progressLabel}>Roll call progress · {progressPercent}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: unit.accentColor }]} />
            </View>

            <View style={styles.bulkActionRow}>
              <Pressable style={[styles.bulkActionButton, styles.bulkPresentButton]} onPress={() => void markAll("present")}>
                <Text style={styles.bulkActionButtonText}>Mark all present</Text>
              </Pressable>
              <View style={styles.bulkActionSpacer} />
              <Pressable style={[styles.bulkActionButton, styles.bulkAbsentButton]} onPress={() => void markAll("absent")}>
                <Text style={styles.bulkActionButtonText}>Mark all absent</Text>
              </Pressable>
            </View>

            <Text style={styles.syncText}>
              {saving ? "Saving locally..." : lastSavedMessage ?? "Tap Present or Absent to save each resident incrementally."}
            </Text>
            <Text style={styles.syncText}>Pending sync items: {pendingSyncCount}</Text>
          </View>

          {loadingResidents || localLoading ? (
            <View style={styles.infoCard}>
              <ActivityIndicator size="small" />
              <Text style={styles.infoText}>Loading residents and saved attendance...</Text>
            </View>
          ) : null}

          {apiError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Resident API error: {apiError}</Text>
            </View>
          ) : null}

          {localError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Local save error: {localError}</Text>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        !loadingResidents && !apiError ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>No residents were returned for this unit.</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  centeredScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F7FB",
  },
  invalidTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#F5F7FB",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  backButtonText: {
    fontWeight: "600",
    color: "#111827",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 4,
  },
  caption: {
    fontSize: 13,
    color: "#6B7280",
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
  },
  bulkActionRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  bulkActionButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  bulkPresentButton: {
    backgroundColor: "#DCFCE7",
  },
  bulkAbsentButton: {
    backgroundColor: "#FEE2E2",
  },
  bulkActionButtonText: {
    fontWeight: "700",
    color: "#111827",
  },
  bulkActionSpacer: {
    width: 8,
  },
  syncText: {
    marginTop: 8,
    fontSize: 12,
    color: "#4B5563",
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#B91C1C",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  infoText: {
    marginTop: 8,
    color: "#4B5563",
    textAlign: "center",
  },
  residentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontWeight: "700",
    fontSize: 15,
  },
  residentBody: {
    flex: 1,
  },
  residentName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  residentMeta: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  residentAux: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  residentStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
  },
  actionSpacer: {
    width: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  presentIdle: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  presentActive: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  absentIdle: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  absentActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  statusButtonText: {
    fontWeight: "700",
    color: "#1F2937",
  },
  statusButtonTextActive: {
    color: "#FFFFFF",
  },
});