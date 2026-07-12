import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { t } from "../../src/i18n";
import { getRollCallUnit, RollCallUnitId } from "../../src/features/rollCall/units";

const DISPLAY_UNITS: RollCallUnitId[] = ["detox", "alcohol"];

export default function DashboardLandingScreen() {
  const router = useRouter();

  const openUnit = (unitId: RollCallUnitId) => {
    router.push({
      pathname: "/(tabs)/unit/[unitId]",
      params: { unitId },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <View style={styles.logoStem} />
          <View style={styles.logoCross} />
          <View style={styles.logoArc} />
        </View>

        <Text style={styles.brand}>{t("brand.title")}</Text>
        <Text style={styles.brandSub}>{t("brand.subtitle")}</Text>
      </View>

      <Text style={styles.title}>{t("landing.title")}</Text>
      <Text style={styles.subtitle}>{t("landing.subtitle")}</Text>

      <View style={styles.cardRow}>
        {DISPLAY_UNITS.map((unitId) => {
          const unit = getRollCallUnit(unitId);

          return (
            <Pressable
              key={unit.id}
              onPress={() => openUnit(unit.id)}
              style={[styles.unitCard, { backgroundColor: unit.surfaceColor, borderColor: `${unit.accentColor}33` }]}
            >
              <View style={[styles.unitIcon, { backgroundColor: `${unit.accentColor}18` }]}>
                <Text style={[styles.unitIconText, { color: unit.accentColor }]}>
                  {unit.id === "detox" ? "D" : "A"}
                </Text>
              </View>

              <Text style={[styles.unitTitle, { color: unit.accentColor }]}>{unit.name}</Text>
              <Text style={styles.unitDescription}>{unit.description}</Text>
              <Text style={[styles.unitLink, { color: unit.accentColor }]}>
                {unit.id === "detox" ? t("landing.detoxCta") : t("landing.alcoholCta")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 44,
    backgroundColor: "#F7FBFF",
  },
  hero: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoMark: {
    width: 76,
    height: 76,
    position: "relative",
    marginBottom: 16,
  },
  logoStem: {
    position: "absolute",
    left: 32,
    top: 10,
    width: 12,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#3157C8",
  },
  logoCross: {
    position: "absolute",
    left: 20,
    top: 24,
    width: 36,
    height: 12,
    borderRadius: 8,
    backgroundColor: "#3157C8",
  },
  logoArc: {
    position: "absolute",
    left: 10,
    top: 14,
    width: 38,
    height: 38,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#89A8FF",
    borderBottomLeftRadius: 28,
    transform: [{ rotate: "28deg" }],
  },
  brand: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2948B6",
  },
  brandSub: {
    marginTop: 6,
    fontSize: 18,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#3D5BD3",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#14213D",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#5B6B87",
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 460,
  },
  cardRow: {
    width: "100%",
    maxWidth: 760,
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  unitCard: {
    width: 260,
    minHeight: 220,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A7B7D9",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  unitIcon: {
    width: 66,
    height: 66,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  unitIconText: {
    fontSize: 28,
    fontWeight: "900",
  },
  unitTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  unitDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4D5D79",
    textAlign: "center",
    marginBottom: 18,
  },
  unitLink: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
