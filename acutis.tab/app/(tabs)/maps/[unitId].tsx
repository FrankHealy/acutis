import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

import { t } from "../../../src/i18n";

type RouteParams = {
  unitId?: string | string[];
};

type RoomLabelKey =
  | "kitchen"
  | "store"
  | "smokingArea"
  | "staffWc"
  | "waitingRoom"
  | "utility";

type RoomDefinition = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  bg?: string;
  labelSize?: number;
  style?: StyleProp<ViewStyle>;
};

type RoundelDefinition = {
  id: string;
  left: number;
  top: number;
};

type Point = {
  x: number;
  y: number;
};

type ExitMarkerDefinition = {
  id: string;
  left: number;
  top: number;
  label: string;
  variant?: "main" | "secondary";
};

const MAP_WIDTH = 1140;
const MAP_HEIGHT = 980;
const MIN_ZOOM = 0.85;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.15;
const ROUNDEL_SIZE = 30;

const STATIC_ROOMS: RoomDefinition[] = [
  { id: "rm15", x: 888, y: 18, w: 132, h: 54, label: "15" },
  { id: "fe", x: 852, y: 72, w: 72, h: 44, label: "FE", bg: "#FFFDE7" },
  { id: "rm14", x: 852, y: 116, w: 72, h: 72, label: "14" },
  { id: "rm13", x: 852, y: 188, w: 72, h: 72, label: "13" },
  { id: "rm12", x: 852, y: 260, w: 72, h: 72, label: "12" },
  { id: "rm11", x: 852, y: 332, w: 72, h: 72, label: "11" },
  { id: "rm10", x: 852, y: 404, w: 72, h: 72, label: "10" },
  { id: "rm9", x: 852, y: 476, w: 72, h: 72, label: "9" },
  { id: "rm8", x: 852, y: 548, w: 72, h: 60, label: "8" },
  {
    id: "rm1",
    x: 0,
    y: 620,
    w: 72,
    h: 66,
    label: "1",
    bg: "#3B82F6",
    style: { borderColor: "#1E3A8A" },
  },
  { id: "rm2", x: 72, y: 620, w: 72, h: 66, label: "2" },
  { id: "rm3", x: 144, y: 620, w: 72, h: 66, label: "3" },
  { id: "rm4", x: 216, y: 620, w: 72, h: 66, label: "4" },
  { id: "rm5", x: 288, y: 620, w: 72, h: 66, label: "5" },
  { id: "ns", x: 426, y: 620, w: 130, h: 66, label: "NS" },
  { id: "tr", x: 556, y: 620, w: 130, h: 66, label: "TR" },
  { id: "op", x: 426, y: 686, w: 130, h: 50, label: "OP" },
  { id: "rm16", x: 722, y: 620, w: 72, h: 66, label: "16" },
  { id: "rm6", x: 794, y: 620, w: 72, h: 66, label: "6" },
  { id: "rm7", x: 888, y: 620, w: 72, h: 66, label: "7" },
  { id: "rm7b", x: 888, y: 686, w: 72, h: 76, label: "RM 7b", labelSize: 10 },
  { id: "sa2", x: 964, y: 566, w: 104, h: 60, label: "SA2", bg: "#C8E6C9" },
];

function createDiagonalRoundels(
  prefix: string,
  x: number,
  y: number,
  w: number,
  h: number,
): RoundelDefinition[] {
  const padX = Math.max(5, Math.round((w - ROUNDEL_SIZE * 2) / 3));
  const padY = Math.max(4, Math.round((h - ROUNDEL_SIZE * 2) / 3));

  return [
    { id: `${prefix}a`, left: x + padX, top: y + padY },
    { id: `${prefix}b`, left: x + w - padX - ROUNDEL_SIZE, top: y + h - padY - ROUNDEL_SIZE },
  ];
}

const ROUNDALS: RoundelDefinition[] = [
  ...createDiagonalRoundels("r1", 0, 620, 72, 66),
  ...createDiagonalRoundels("r2", 72, 620, 72, 66),
  ...createDiagonalRoundels("r3", 144, 620, 72, 66),
  ...createDiagonalRoundels("r4", 216, 620, 72, 66),
  ...createDiagonalRoundels("r5", 288, 620, 72, 66),
  ...createDiagonalRoundels("r16", 722, 620, 72, 66),
  ...createDiagonalRoundels("r6", 794, 620, 72, 66),
  ...createDiagonalRoundels("r7", 888, 620, 72, 66),
  ...createDiagonalRoundels("r8", 852, 548, 72, 60),
  ...createDiagonalRoundels("r9", 852, 476, 72, 72),
  ...createDiagonalRoundels("r10", 852, 404, 72, 72),
  ...createDiagonalRoundels("r11", 852, 332, 72, 72),
  ...createDiagonalRoundels("r12", 852, 260, 72, 72),
  ...createDiagonalRoundels("r13", 852, 188, 72, 72),
  ...createDiagonalRoundels("r14", 852, 116, 72, 72),
];

function ExitMarker({ left, top, label, variant = "secondary" }: ExitMarkerDefinition) {
  return (
    <View
      style={[
        styles.exitMarker,
        variant === "main" ? styles.exitMarkerMain : styles.exitMarkerSecondary,
        { left, top },
      ]}
    >
      <Text style={[styles.exitBadge, variant === "main" ? styles.exitBadgeMain : styles.exitBadgeSecondary]}>
        {t("maps.detox.exitBadge", "Exit")}
      </Text>
      <Text style={styles.exitLabel}>{label}</Text>
    </View>
  );
}

function RectLabel({ x, y, w, h, label, bg = "#D9D9D9", labelSize = 12, style }: RoomDefinition) {
  return (
    <View
      style={[
        styles.room,
        {
          left: x,
          top: y,
          width: w,
          height: h,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <Text style={[styles.roomLabel, { fontSize: labelSize }]}>{label}</Text>
    </View>
  );
}

function RoomInspectorTag({ room }: { room: RoomDefinition }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.inspectorTag,
        {
          left: room.x + 4,
          top: room.y + 4,
        },
      ]}
    >
      <Text style={styles.inspectorTagText}>{room.id}</Text>
    </View>
  );
}

function Roundel({
  left,
  top,
  selected,
  onPress,
}: RoundelDefinition & { selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roundel, selected ? styles.roundelSelected : null, { left, top }]}
    />
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampOffset(offset: Point, scale: number, viewport: Point): Point {
  if (scale <= 1 || viewport.x === 0 || viewport.y === 0) {
    return { x: 0, y: 0 };
  }

  const scaledWidth = MAP_WIDTH * scale;
  const scaledHeight = MAP_HEIGHT * scale;
  const maxX = Math.max(0, (scaledWidth - viewport.x) / 2);
  const maxY = Math.max(0, (scaledHeight - viewport.y) / 2);

  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
}

function DetoxRoomMapNative() {
  const { width } = useWindowDimensions();
  const fitScale = useMemo(() => Math.min(1, (width - 96) / MAP_WIDTH), [width]);
  const [zoom, setZoom] = useState(1);
  const [showIds, setShowIds] = useState(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<Point>({ x: 0, y: 0 });
  const [selectedRoundels, setSelectedRoundels] = useState<Record<string, boolean>>({});

  const offsetRef = useRef(offset);
  const zoomRef = useRef(zoom);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    setOffset((current) => clampOffset(current, fitScale * zoom, viewportSize));
  }, [fitScale, viewportSize, zoom]);

  const effectiveScale = fitScale * zoom;
  const localizedRooms = useMemo<RoomDefinition[]>(
    () => [
      ...STATIC_ROOMS,
      {
        id: "store",
        x: 556,
        y: 686,
        w: 130,
        h: 50,
        label: t("maps.detox.labels.store", "Store"),
      },
      {
        id: "kitchen",
        x: 426,
        y: 736,
        w: 130,
        h: 200,
        label: t("maps.detox.labels.kitchen", "Detox Kitchen"),
        labelSize: 11,
      },
      {
        id: "sa1",
        x: 216,
        y: 686,
        w: 144,
        h: 44,
        label: t("maps.detox.labels.smokingArea", "SA1 (Smoking Area)"),
        bg: "#C8E6C9",
        labelSize: 10,
      },
      {
        id: "staffWc",
        x: 288,
        y: 730,
        w: 72,
        h: 56,
        label: t("maps.detox.labels.staffWc", "Staff WC"),
        labelSize: 10,
      },
      {
        id: "waitingRoom",
        x: 288,
        y: 786,
        w: 72,
        h: 58,
        label: t("maps.detox.labels.waitingRoom", "Waiting Room"),
        labelSize: 9,
      },
      {
        id: "utility",
        x: 288,
        y: 844,
        w: 72,
        h: 90,
        label: t("maps.detox.labels.utility", "Utility"),
        labelSize: 10,
      },
    ],
    [],
  );
  const exitMarkers = useMemo<ExitMarkerDefinition[]>(
    () => [
      {
        id: "fire-exit",
        left: 768,
        top: 58,
        label: t("maps.detox.fireExit", "Fire Exit"),
      },
      {
        id: "main-entrance",
        left: 112,
        top: 520,
        label: t("maps.detox.mainEntrance", "Main Entrance"),
        variant: "main",
      },
      {
        id: "staff-entrance",
        left: 454,
        top: 578,
        label: t("maps.detox.staffEntrance", "Staff Entrance"),
      },
    ],
    [],
  );

  const updateZoom = (nextZoom: number) => {
    const boundedZoom = clamp(Number(nextZoom.toFixed(2)), MIN_ZOOM, MAX_ZOOM);
    const boundedOffset = clampOffset(offsetRef.current, fitScale * boundedZoom, viewportSize);
    setZoom(boundedZoom);
    setOffset(boundedOffset);
  };

  const zoomOut = () => {
    const next = zoomRef.current - ZOOM_STEP;
    if (next <= 1) {
      setZoom(Math.max(MIN_ZOOM, 1));
      setOffset({ x: 0, y: 0 });
      return;
    }

    updateZoom(next);
  };

  const zoomIn = () => {
    updateZoom(zoomRef.current + ZOOM_STEP);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const toggleRoundel = (id: string) => {
    setSelectedRoundels((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    setViewportSize({ x: nextWidth, y: nextHeight });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: ({ nativeEvent }) => nativeEvent.touches.length > 1,
        onMoveShouldSetPanResponder: ({ nativeEvent }, gestureState) =>
          nativeEvent.touches.length > 1 ||
          (zoomRef.current > 1 && (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6)),
        onMoveShouldSetPanResponderCapture: ({ nativeEvent }, gestureState) =>
          nativeEvent.touches.length > 1 ||
          (zoomRef.current > 1 && (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6)),
        onPanResponderGrant: (event) => {
          dragStart.current = offsetRef.current;

          if (event.nativeEvent.touches.length === 2) {
            const [first, second] = event.nativeEvent.touches;
            pinchStartDistance.current = Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY);
            pinchStartZoom.current = zoomRef.current;
          } else {
            pinchStartDistance.current = null;
          }
        },
        onPanResponderMove: (event, gestureState) => {
          if (event.nativeEvent.touches.length === 2) {
            const [first, second] = event.nativeEvent.touches;
            const distance = Math.hypot(second.pageX - first.pageX, second.pageY - first.pageY);
            if (!pinchStartDistance.current || pinchStartDistance.current === 0) {
              pinchStartDistance.current = distance;
              pinchStartZoom.current = zoomRef.current;
              return;
            }

            updateZoom((distance / pinchStartDistance.current) * pinchStartZoom.current);
            return;
          }

          if (zoomRef.current <= 1) {
            return;
          }

          const nextOffset = clampOffset(
            {
              x: dragStart.current.x + gestureState.dx,
              y: dragStart.current.y + gestureState.dy,
            },
            fitScale * zoomRef.current,
            viewportSize,
          );

          setOffset(nextOffset);
        },
        onPanResponderRelease: () => {
          pinchStartDistance.current = null;
        },
        onPanResponderTerminate: () => {
          pinchStartDistance.current = null;
        },
        onShouldBlockNativeResponder: () => false,
      }),
    [fitScale, viewportSize],
  );

  return (
    <View style={styles.mapShell}>
      <View style={styles.mapToolbar}>
        <View>
          <Text style={styles.mapTitle}>{t("maps.detox.title", "Detox Room Map")}</Text>
          <Text style={styles.mapHint}>{t("maps.detox.pinchHint", "Pinch or drag to inspect the plan.")}</Text>
        </View>

        <View style={styles.toolbarActions}>
          <Pressable onPress={() => setShowIds((current) => !current)} style={styles.inspectButton}>
            <Text style={styles.inspectButtonText}>
              {showIds ? t("maps.detox.hideIds", "Hide IDs") : t("maps.detox.showIds", "Show IDs")}
            </Text>
          </Pressable>

          <View style={styles.zoomGroup}>
            <Pressable onPress={zoomOut} style={styles.zoomButton}>
              <Text style={styles.zoomButtonText}>-</Text>
            </Pressable>
            <Text style={styles.zoomValue}>{Math.round(effectiveScale * 100)}%</Text>
            <Pressable onPress={zoomIn} style={styles.zoomButton}>
              <Text style={styles.zoomButtonText}>+</Text>
            </Pressable>
          </View>

          <Pressable onPress={resetView} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>{t("maps.detox.reset", "Reset")}</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.inspectSummary}>
        {t("maps.detox.roomCount", "Rectangles")}: {localizedRooms.length}
      </Text>

      {showIds ? (
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t("maps.detox.legendTitle", "Rectangle Legend")}</Text>
          <View style={styles.legendHeader}>
            <Text style={[styles.legendHeaderText, styles.legendIdColumn]}>
              {t("maps.detox.legendId", "ID")}
            </Text>
            <Text style={[styles.legendHeaderText, styles.legendLabelColumn]}>
              {t("maps.detox.legendLabel", "Label")}
            </Text>
          </View>

          {localizedRooms.map((room) => (
            <View key={`${room.id}-legend`} style={styles.legendRow}>
              <Text style={[styles.legendIdText, styles.legendIdColumn]}>{room.id}</Text>
              <Text style={[styles.legendLabelText, styles.legendLabelColumn]}>{room.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View onLayout={handleViewportLayout} style={styles.mapViewport}>
        <View
          {...panResponder.panHandlers}
          style={[
            styles.mapCanvas,
            {
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
              transform: [{ scale: effectiveScale }, { translateX: offset.x }, { translateY: offset.y }],
            },
          ]}
        >
          <View style={styles.corridorHorizontal} />
          <View style={styles.corridorVertical} />
          <View style={styles.courtyard} />
          <View style={styles.courtyardSpine} />
          <View style={styles.ptBox}>
            <Text style={styles.ptLabel}>PT</Text>
          </View>

          <View style={styles.entranceDiamond} />
          <Text style={styles.entranceLabel}>{t("maps.detox.labels.entrance", "Main Entrance")}</Text>

          {localizedRooms.map((room) => (
            <RectLabel key={room.id} {...room} />
          ))}

          <View style={styles.feDoorGap} />
          <View style={styles.feDoorJambTop} />
          <View style={styles.feDoorJambBottom} />

          {showIds &&
            localizedRooms.map((room) => <RoomInspectorTag key={`${room.id}-tag`} room={room} />)}

          {ROUNDALS.map((roundel) => (
            <Roundel
              key={roundel.id}
              {...roundel}
              selected={Boolean(selectedRoundels[roundel.id])}
              onPress={() => toggleRoundel(roundel.id)}
            />
          ))}

          {exitMarkers.map((marker) => (
            <ExitMarker key={marker.id} {...marker} />
          ))}

          <Text style={styles.verticalCaption}>VC</Text>

          <View style={styles.lc1}>
            <Text style={styles.lc1Label}>LC1</Text>
          </View>

          <View style={styles.sectionWallLeft} />
          <View style={styles.sectionWallRight} />
        </View>
      </View>
    </View>
  );
}

export default function UnitMapScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const rawUnitId = Array.isArray(params.unitId) ? params.unitId[0] : params.unitId;

  if (rawUnitId !== "detox") {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>{t("maps.detox.unavailableTitle", "Room map not available")}</Text>
        <Text style={styles.emptyText}>{t("maps.detox.unavailableText", "The tablet map is currently enabled for Detox only.")}</Text>
        <Link href="/(tabs)/dashboard" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>{t("maps.detox.backToDashboard", "Back to dashboard")}</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Link href="/(tabs)/unit/detox" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("maps.detox.backToDetox", "Back to Detox")}</Text>
        </Pressable>
      </Link>

      <View style={styles.headerCard}>
        <Text style={styles.title}>{t("maps.detox.title", "Detox Room Map")}</Text>
        <Text style={styles.subtitle}>{t("maps.detox.subtitle", "Native tablet version based on the Detox floor plan.")}</Text>
      </View>

      <DetoxRoomMapNative />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F4F8FF",
  },
  emptyScreen: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F8FF",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  backButtonText: {
    color: "#1D4ED8",
    fontWeight: "800",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  mapShell: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D7E3F6",
    padding: 18,
  },
  mapToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  mapHint: {
    fontSize: 13,
    color: "#64748B",
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inspectButton: {
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D7E3F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inspectButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
  zoomGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  zoomButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D7E3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomButtonText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  zoomValue: {
    minWidth: 58,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
  resetButton: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E3F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  inspectSummary: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
  },
  legendCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },
  legendHeader: {
    flexDirection: "row",
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  legendHeaderText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  legendRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  legendIdColumn: {
    width: 96,
  },
  legendLabelColumn: {
    flex: 1,
  },
  legendIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  legendLabelText: {
    fontSize: 12,
    color: "#334155",
  },
  mapViewport: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 740,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  mapCanvas: {
    position: "relative",
    backgroundColor: "#F5F5F5",
  },
  corridorHorizontal: {
    position: "absolute",
    left: 0,
    top: 558,
    width: 852,
    height: 62,
    backgroundColor: "#FFFDE7",
    borderTopWidth: 4,
    borderTopColor: "#111111",
  },
  corridorVertical: {
    position: "absolute",
    left: 924,
    top: 72,
    width: 72,
    height: 548,
    backgroundColor: "#FFFDE7",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: "#111111",
  },
  courtyard: {
    position: "absolute",
    left: 250,
    top: 210,
    width: 292,
    height: 180,
    backgroundColor: "#E6F7E6",
    borderWidth: 1,
    borderColor: "#C7D9C7",
  },
  courtyardSpine: {
    position: "absolute",
    left: 366,
    top: 210,
    width: 26,
    height: 180,
    backgroundColor: "#E0E0E0",
    borderWidth: 1,
    borderColor: "#C7C7C7",
  },
  ptBox: {
    position: "absolute",
    left: 356,
    top: 258,
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#C0C0C0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#6B7280",
  },
  ptLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  entranceDiamond: {
    position: "absolute",
    left: 40,
    top: 456,
    width: 82,
    height: 82,
    backgroundColor: "#FFFDE7",
    borderWidth: 5,
    borderColor: "#111111",
    transform: [{ rotate: "45deg" }],
  },
  entranceLabel: {
    position: "absolute",
    left: 130,
    top: 490,
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  room: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#333333",
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingRight: 6,
  },
  roomLabel: {
    textAlign: "right",
    fontWeight: "800",
    color: "#111111",
  },
  feDoorGap: {
    position: "absolute",
    left: 850,
    top: 84,
    width: 4,
    height: 18,
    backgroundColor: "#F5F5F5",
    zIndex: 5,
  },
  feDoorJambTop: {
    position: "absolute",
    left: 846,
    top: 82,
    width: 10,
    height: 3,
    backgroundColor: "#111111",
    zIndex: 5,
  },
  feDoorJambBottom: {
    position: "absolute",
    left: 846,
    top: 102,
    width: 10,
    height: 3,
    backgroundColor: "#111111",
    zIndex: 5,
  },
  inspectorTag: {
    position: "absolute",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    zIndex: 7,
  },
  inspectorTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  blueRoom: {
    borderColor: "#1E3A8A",
  },
  roundel: {
    position: "absolute",
    width: ROUNDEL_SIZE,
    height: ROUNDEL_SIZE,
    borderRadius: ROUNDEL_SIZE / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#666666",
  },
  roundelSelected: {
    backgroundColor: "#F9A8D4",
    borderColor: "#DB2777",
  },
  exitMarker: {
    position: "absolute",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 118,
    zIndex: 6,
  },
  exitMarkerMain: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FBCFE8",
  },
  exitMarkerSecondary: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  exitBadge: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  exitBadgeMain: {
    color: "#BE123C",
  },
  exitBadgeSecondary: {
    color: "#047857",
  },
  exitLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  verticalCaption: {
    position: "absolute",
    left: 930,
    top: 320,
    color: "#4B5563",
    fontWeight: "800",
    transform: [{ rotate: "90deg" }],
  },
  lc1: {
    position: "absolute",
    left: 360,
    top: 620,
    width: 66,
    height: 314,
    backgroundColor: "#FFFDE7",
    borderWidth: 1,
    borderColor: "#333333",
  },
  lc1Label: {
    position: "absolute",
    top: 112,
    left: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },
  sectionWallLeft: {
    position: "absolute",
    left: 0,
    top: 620,
    width: 360,
    height: 4,
    backgroundColor: "#111111",
  },
  sectionWallRight: {
    position: "absolute",
    left: 426,
    top: 620,
    width: 426,
    height: 4,
    backgroundColor: "#111111",
  },
});
