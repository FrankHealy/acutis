import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";

const DB_NAME = "acutis.db";
const DB_KEY_STORAGE_KEY = "acutis.db.encryptionKey";
type SqlParam = string | number | null;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function randomKey(length = 64): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getDatabaseKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DB_KEY_STORAGE_KEY);
  if (existing) return existing;

  const generated = randomKey();
  await SecureStore.setItemAsync(DB_KEY_STORAGE_KEY, generated, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
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
