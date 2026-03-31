import { Redirect, Slot } from "expo-router";
import { LoadingScreen } from "../../src/components/ui/LoadingScreen";
import { useAuth } from "../../src/services/auth/AuthContext";

export default function TabsLayout() {
  const { state } = useAuth();

  if (state === "checking") {
    return <LoadingScreen message="Checking your session..." />;
  }

  if (state !== "authenticated") {
    return <Redirect href="/" />;
  }

  return <Slot />;
}
