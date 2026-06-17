const canonicalHost = "https://acutis.salientrecovery.com";
const apiBaseUrl = `${canonicalHost}/api-proxy`;
const keycloakBaseUrl = `${canonicalHost}/keycloak`;
const scheme = process.env.ACUTIS_TAB_SCHEME || "acutis-tab";

const boolFromEnv = (value) => String(value ?? "").toLowerCase() === "true";

module.exports = {
  expo: {
    name: "acutis.tab",
    slug: "acutis-tab",
    scheme,
    platforms: ["android"],
    plugins: [
      "expo-router",
      "expo-localization",
      [
        "expo-speech-recognition",
        {
          androidSpeechServicePackages: [
            "com.google.android.as",
            "com.google.android.tts",
            "com.google.android.googlequicksearchbox",
          ],
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Acutis Tablet to attach admission photos.",
          cameraPermission: "Allow Acutis Tablet to capture admission photos.",
        },
      ],
    ],
    extra: {
      router: {},
      apiBaseUrl: process.env.ACUTIS_TAB_API_BASE_URL || apiBaseUrl,
      keycloak: {
        baseUrl: process.env.ACUTIS_TAB_KEYCLOAK_BASE_URL || keycloakBaseUrl,
        issuer: process.env.ACUTIS_TAB_KEYCLOAK_ISSUER || `${keycloakBaseUrl}/realms/acutisrealm`,
        authUrl: process.env.ACUTIS_TAB_KEYCLOAK_AUTH_URL || `${keycloakBaseUrl}/realms/acutisrealm/protocol/openid-connect/auth`,
        clientId: process.env.ACUTIS_TAB_KEYCLOAK_CLIENT_ID || "tab-client",
        audience: process.env.ACUTIS_TAB_KEYCLOAK_AUDIENCE || "api-client",
        redirectUri: process.env.ACUTIS_TAB_REDIRECT_URI || `${scheme}://redirect`,
      },
      development: {
        authorizationDisabled: boolFromEnv(process.env.ACUTIS_TAB_AUTH_DISABLED),
      },
      security: {
        requireHardwareBackedKeystore: process.env.ACUTIS_TAB_REQUIRE_HARDWARE_KEYSTORE
          ? boolFromEnv(process.env.ACUTIS_TAB_REQUIRE_HARDWARE_KEYSTORE)
          : true,
      },
      eas: {
        projectId: "b5f5142e-085e-4803-b48a-e4fd3e53a80d",
      },
    },
    android: {
      package: "com.salientrecovery.acutis.tab",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
    },
  },
};
