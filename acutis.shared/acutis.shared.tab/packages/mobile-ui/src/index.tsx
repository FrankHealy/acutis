import type { ReactNode } from "react";
import { SafeAreaView, Text, View } from "react-native";
export function MobileProductShell({ productName, organisationName, demo, poweredByLabel, demoLabel, children }: { productName: string; organisationName: string; demo?: boolean; poweredByLabel:string; demoLabel:string; children: ReactNode }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}><View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#d7e2f1" }}><Text accessibilityRole="header" style={{ fontSize: 22, color: "#0f172a", fontWeight: "700" }}>{organisationName}</Text><Text style={{ color: "#2563eb" }}>{poweredByLabel} {productName}{demo ? ` · ${demoLabel}` : ""}</Text></View><View style={{ flex: 1, padding: 20 }}>{children}</View></SafeAreaView>;
}
