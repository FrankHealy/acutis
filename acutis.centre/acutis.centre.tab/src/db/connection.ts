import * as SQLite from "expo-sqlite";
import { getRandomBytesAsync } from "expo-crypto";

import {
  migrateSecureStoreSecret,
  setHardwareSecret,
} from "../services/security/hardwareKeychain";

const DB_NAME = "acutis.db";
const DB_KEY_STORAGE_KEY = "acutis.db.encryptionKey";
const DB_KEY_SERVICE = "acutis.db.encryptionKey";
type SqlParam = string | number | null;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function randomKey(byteLength = 32): Promise<string> {
  const bytes = await getRandomBytesAsync(byteLength);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function getDatabaseKey(): Promise<string> {
  const existing = await migrateSecureStoreSecret(DB_KEY_SERVICE, DB_KEY_STORAGE_KEY);
  if (existing) return existing;

  const generated = await randomKey();
  await setHardwareSecret(DB_KEY_SERVICE, generated);
  return generated;
}

export async function openEncryptedDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const key = await getDatabaseKey();
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      try {
        await db.execAsync(`PRAGMA key = '${key}';`);
      } catch (error) {
        console.warn("encrypted DB pragma failed - ensure SQLCipher plugin is installed", error);
      }

      return db;
    })();
  }

  return databasePromise;
}

export async function queryAll<T = unknown>(
  db: SQLite.SQLiteDatabase,
  sql: string,
  args: SqlParam[] = []
): Promise<T[]> {
  return db.getAllAsync<T>(sql, ...(args as any[]));
}

export async function executeSql(
  db: SQLite.SQLiteDatabase,
  sql: string,
  args: SqlParam[] = []
): Promise<void> {
  await db.runAsync(sql, ...(args as any[]));
}
