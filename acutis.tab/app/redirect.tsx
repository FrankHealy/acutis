import { router } from "expo-router";
import { useEffect } from "react";
import { LoadingScreen } from "../src/components/ui/LoadingScreen";
import { useAuth } from "../src/services/auth/AuthContext";

export default function OAuthRedirectScreen() {
  const { state } = useAuth();

  useEffect(() => {
    if (state === "authenticated") {
      router.replace("/(tabs)/community");
      return;
    }

    if (state === "unauthenticated") {
      router.replace("/");
    }
  }, [state]);

  return <LoadingScreen message="Completing sign in..." />;
}
