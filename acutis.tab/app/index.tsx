import { Redirect } from "expo-router";
import { useEffect, useRef } from "react";
import { LoadingScreen } from "../src/components/ui/LoadingScreen";
import { useAuth } from "../src/services/auth/AuthContext";

export default function IndexScreen() {
  const { state, signIn } = useAuth();
  const attemptedAutoSignIn = useRef(false);

  useEffect(() => {
    if (state === "unauthenticated" && !attemptedAutoSignIn.current) {
      attemptedAutoSignIn.current = true;
      signIn().catch((error) => {
        console.warn("Keycloak sign-in failed", error);
      });
    }
  }, [state, signIn]);

  if (state === "authenticated") {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return (
    <LoadingScreen
      message={state === "checking" ? "Checking your session..." : "Opening Keycloak..."}
    />
  );
}