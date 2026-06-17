# Galaxy Tab Active5 Hardening Notes

These items are the target-hardware checks for the Samsung Galaxy Tab Active5 deployment.

## Security

- OIDC access and refresh tokens are stored through `react-native-keychain`.
- The local encrypted database key is stored through the same hardware-backed keychain path.
- Production config leaves `ACUTIS_TAB_REQUIRE_HARDWARE_KEYSTORE=true`, which requests Android secure hardware storage and rejects weaker storage.
- Fire OS, emulators, and sideload sandboxes may need `ACUTIS_TAB_REQUIRE_HARDWARE_KEYSTORE=false` for development only.

## Identity

- `tab-client` uses Keycloak authorization-code + PKCE with `acutis-tab://redirect`.
- API calls fetch the access token from keychain at request time and attach `Authorization: Bearer ...`.
- 401 responses clear stored tokens so the user must re-authenticate.

## Dictation

- Admission dictation is configured for `en-IE`.
- Android dictation requests on-device recognition with Google Android System Intelligence (`com.google.android.as`) and prefers offline recognition.
- On first Active5 setup, confirm the Irish English offline speech pack is installed when prompted.

## Signature

- Signature capture stores vector strokes with timestamp and pressure where React Native exposes pressure.
- Active5 validation still needs a physical tablet pass to confirm S-Pen pressure behaviour and decide whether a small native stylus event module is required for tool type, tilt, and raw electromagnetic pressure.

