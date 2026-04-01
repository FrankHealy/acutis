import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { t } from "../../../src/i18n";
import { getRollCallDateLabel, getRollCallUnit, getRollCallWindowLabel, isRollCallUnitId } from "../../../src/features/rollCall/units";

type RouteParams = {
  unitId?: string | string[];
};

type DashboardMetric = {
  value: string;
  label: string;
  accent?: string;
};

type TimelineItem = {
  time: string;
  title: string;
  subtitle?: string;
  accent: string;
  active?: boolean;
};

type ActionCard = {
  title: string;
  href?: string;
  accent: string;
  surface: string;
  state?: string;
};

type UnitDashboardModel = {
  overview: string;
  metrics: DashboardMetric[];
  timeline: TimelineItem[];
  actions: ActionCard[];
};

const UNIT_MODELS: Record<"detox" | "alcohol", UnitDashboardModel> = {
  detox: {
    overview: t("units.detox.overview"),
    metrics: [
      { value: "8/12", label: t("units.detox.occupancyLabel"), accent: "#EF4444" },
      { value: "1", label: t("dashboard.admissionsToday") },
      { value: "8", label: t("dashboard.activeResidents") },
    ],
    timeline: [
      { time: "06:30", title: "Wake Up Bell", accent: "#F97316" },
      { time: "07:45", title: "Works / Group", subtitle: "Mon: Works | Tue-Fri: Group", accent: "#A855F7" },
      { time: "08:30", title: "Room Check", accent: "#22C55E" },
      { time: "09:05", title: "OT", accent: "#0EA5A8", active: true },
      { time: "12:30", title: "Lunch", accent: "#EF4444" },
    ],
    actions: [
      { title: t("dashboard.roomMap"), href: "/(tabs)/maps/detox", accent: "#16A34A", surface: "#EDF9F0" },
      { title: t("dashboard.admissions"), href: "/(tabs)/admissions?unit=detox", accent: "#2563EB", surface: "#EEF4FF" },
      { title: t("dashboard.residents"), accent: "#9333EA", surface: "#F6EEFF", state: t("dashboard.availableSoon") },
      { title: t("dashboard.incidents"), accent: "#F97316", surface: "#FFF2E8", state: t("dashboard.availableSoon") },
    ],
  },
  alcohol: {
    overview: t("units.alcohol.overview"),
    metrics: [
      { value: "14/18", label: t("units.alcohol.occupancyLabel"), accent: "#2563EB" },
      { value: "2", label: t("dashboard.admissionsToday") },
      { value: "14", label: t("dashboard.activeResidents") },
    ],
    timeline: [
      { time: "07:00", title: "Morning Check-In", accent: "#2563EB" },
      { time: "08:00", title: "Breakfast", accent: "#F97316" },
      { time: "09:15", title: "Group Session", subtitle: "Main programme room", accent: "#8B5CF6", active: true },
      { time: "11:00", title: "Resident Reviews", accent: "#0EA5A8" },
      { time: "12:30", title: "Lunch", accent: "#EF4444" },
      { time: "14:00", title: "Recovery Planning", accent: "#16A34A" },
    ],
    actions: [
      { title: t("dashboard.rollCall"), href: "/(tabs)/roll-call/alcohol", accent: "#2563EB", surface: "#EEF4FF" },
      { title: t("dashboard.admissions"), accent: "#16A34A", surface: "#EDF9F0", state: t("dashboard.availableSoon") },
      { title: t("dashboard.residents"), accent: "#9333EA", surface: "#F6EEFF", state: t("dashboard.availableSoon") },
      { title: t("dashboard.incidents"), accent: "#F97316", surface: "#FFF2E8", state: t("dashboard.availableSoon") },
    ],
  },
};

function UnitActionCard({ action }: { action: ActionCard }) {
  const content = (
    <View style={[styles.actionCard, { backgroundColor: action.surface }]}>
      <View style={[styles.actionGlyph, { borderColor: `${action.accent}44`, backgroundColor: `${action.accent}16` }]}>
        <Text style={[styles.actionGlyphText, { color: action.accent }]}>{action.title.charAt(0)}</Text>
      </View>
      <Text style={[styles.actionTitle, { color: action.accent }]}>{action.title}</Text>
      <Text style={styles.actionState}>{action.state ?? t("dashboard.liveAction")}</Text>
    </View>
  );

  if (!action.href) {
    return content;
  }

  return (
    <Link href={action.href as never} asChild>
      <Pressable>{content}</Pressable>
    </Link>
  );
}

export default function UnitDashboardScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const router = useRouter();
  const rawUnitId = Array.isArray(params.unitId) ? params.unitId[0] : params.unitId;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!rawUnitId || !isRollCallUnitId(rawUnitId)) {
    return (
      <View style={styles.invalidScreen}>
        <Text style={styles.invalidTitle}>Unknown unit</Text>
        <Pressable onPress={() => router.replace("/(tabs)/dashboard")} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to landing</Text>
        </Pressable>
      </View>
    );
  }

  const unit = getRollCallUnit(rawUnitId);
  const model = UNIT_MODELS[rawUnitId];
  const dateLabel = useMemo(() => getRollCallDateLabel(now), [now]);
  const timeLabel = useMemo(
    () => now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    [now],
  );

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.headerShell}>
        <View style={styles.brandBlock}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>A</Text>
          </View>

          <View>
            <Text style={styles.brandTitle}>{t("brand.title")}</Text>
            <Text style={styles.brandSubtitle}>{t("brand.centre")}</Text>
          </View>

          <View style={[styles.unitPill, { borderColor: `${unit.accentColor}33`, backgroundColor: unit.surfaceColor }]}>
            <Text style={styles.unitPillLabel}>{t(`units.${rawUnitId}.currentUnitLabel`)}</Text>
            <Text style={[styles.unitPillValue, { color: unit.accentColor }]}>{unit.name}</Text>
          </View>
        </View>

        <View style={styles.headerMeta}>
          <Text style={styles.metaText}>{dateLabel}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{t("dashboard.currentTime")}: {timeLabel}</Text>
        </View>

        <Text style={styles.overview}>{model.overview}</Text>
      </View>

      <View style={styles.metricRow}>
        {model.metrics.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[styles.metricValue, metric.accent ? { color: metric.accent } : null]}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timelineCard}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t(`units.${rawUnitId}.timelineTitle`)}</Text>
          <View style={styles.windowPill}>
            <Text style={styles.windowPillText}>{getRollCallWindowLabel(now)} {t("dashboard.schedule")}</Text>
          </View>
        </View>

        <View style={styles.timelineRail} />

        <View style={styles.timelineRow}>
          {model.timeline.map((item) => (
            <View key={`${item.time}-${item.title}`} style={styles.timelineNode}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: item.accent, borderColor: item.active ? "#D97706" : item.accent },
                  item.active ? styles.timelineDotActive : null,
                ]}
              >
                <Text style={styles.timelineDotText}>{item.title.charAt(0)}</Text>
              </View>

              <Text style={styles.timelineTime}>{item.time}</Text>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.timelineSubtitle}>{item.subtitle}</Text> : null}
              {item.active ? <Text style={styles.timelineNow}>{t("dashboard.now")}</Text> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>{t(`units.${rawUnitId}.quickActionsTitle`)}</Text>
        <View style={styles.actionGrid}>
          {model.actions.map((action) => (
            <UnitActionCard key={action.title} action={action} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F4F8FF",
  },
  invalidScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F4F8FF",
  },
  invalidTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  headerShell: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    marginBottom: 18,
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2F5BCE",
    alignItems: "center",
    justifyContent: "center",
  },
  brandBadgeText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  unitPill: {
    marginLeft: "auto",
    minWidth: 170,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unitPillLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 2,
  },
  unitPillValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  metaText: {
    fontSize: 14,
    color: "#64748B",
  },
  metaDot: {
    fontSize: 14,
    color: "#94A3B8",
  },
  overview: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    marginTop: 16,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D7E3F6",
  },
  metricLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0F172A",
  },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    marginBottom: 18,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  windowPill: {
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  windowPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3157C8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  timelineRail: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D9E4F4",
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  timelineNode: {
    width: 108,
    alignItems: "center",
  },
  timelineDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 10,
  },
  timelineDotActive: {
    transform: [{ scale: 1.08 }],
    shadowColor: "#D97706",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  timelineDotText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  timelineTime: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  timelineSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    color: "#64748B",
    textAlign: "center",
  },
  timelineNow: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "800",
    color: "#D97706",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D7E3F6",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14,
  },
  actionCard: {
    width: 160,
    minHeight: 132,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionGlyph: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionGlyphText: {
    fontSize: 20,
    fontWeight: "900",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  actionState: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
