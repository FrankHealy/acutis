import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";

const DB_NAME = "acutis.db";
const DB_KEY_STORAGE_KEY = "acutis.db.encryptionKey";

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

export async function openEncryptedDatabase(): Promise<SQLite.WebSQLDatabase> {
  const key = await getDatabaseKey();
  const db = SQLite.openDatabase(DB_NAME);

  // SQLCipher pragma is applied if plugin supports it. If not, this is a no-op guard.
  await new Promise<void>((resolve, reject) => {
    db.exec(
      [{ sql: `PRAGMA key = '${key}';`, args: [] }],
      false,
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  }).catch((error) => {
    console.warn("encrypted DB pragma failed - ensure SQLCipher plugin is installed", error);
  });

  return db;
}

export function runQuery<T = any>(
  db: SQLite.WebSQLDatabase,
  sql: string,
  args: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        args,
        (_, result) => {
          const rows = [] as T[];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          resolve(rows);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}
