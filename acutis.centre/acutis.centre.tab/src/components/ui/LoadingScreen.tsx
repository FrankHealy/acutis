import { ActivityIndicator, Text, View } from "react-native";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12, fontSize: 16 }}>{message}</Text>
    </View>
  );
}
