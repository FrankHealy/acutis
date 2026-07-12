import * as SecureStore from "expo-secure-store";
import * as Keychain from "react-native-keychain";

import { isHardwareBackedKeystoreRequired } from "../../constants/runtimeConfig";

const USERNAME = "acutis";

const HARDWARE_OPTIONS: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
};

const READ_OPTIONS: Keychain.GetOptions = {};

function isSecureHardware(level: Keychain.SECURITY_LEVEL | null): boolean {
  return level === Keychain.SECURITY_LEVEL.SECURE_HARDWARE;
}

async function assertHardwareBacked(service: string): Promise<void> {
  if (!isHardwareBackedKeystoreRequired()) {
    return;
  }

  const level = await Keychain.getSecurityLevel();
  if (!isSecureHardware(level)) {
    await Keychain.resetGenericPassword({ service });
    throw new Error(`Hardware-backed keystore is required for ${service}.`);
  }
}

export async function setHardwareSecret(service: string, value: string): Promise<void> {
  const result = await Keychain.setGenericPassword(USERNAME, value, {
    ...HARDWARE_OPTIONS,
    service,
  });

  if (!result) {
    throw new Error(`Failed to store ${service} in the hardware-backed keystore.`);
  }

  await assertHardwareBacked(service);
}

export async function getHardwareSecret(service: string): Promise<string | undefined> {
  await assertHardwareBacked(service);
  const credentials = await Keychain.getGenericPassword({
    ...READ_OPTIONS,
    service,
  });

  return credentials ? credentials.password : undefined;
}

export async function deleteHardwareSecret(service: string): Promise<void> {
  await Keychain.resetGenericPassword({ service });
}

export async function deleteLegacySecureStoreSecret(secureStoreKey: string): Promise<void> {
  await SecureStore.deleteItemAsync(secureStoreKey);
}

export async function migrateSecureStoreSecret(
  service: string,
  secureStoreKey: string
): Promise<string | undefined> {
  const existing = await getHardwareSecret(service);
  if (existing) {
    return existing;
  }

  const legacy = await SecureStore.getItemAsync(secureStoreKey);
  if (!legacy) {
    return undefined;
  }

  await setHardwareSecret(service, legacy);
  await deleteLegacySecureStoreSecret(secureStoreKey);
  return legacy;
}
