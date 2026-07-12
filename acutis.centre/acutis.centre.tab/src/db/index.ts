import { initializeSchema } from "./schema";

let initialized = false;

export async function bootstrapDatabase(): Promise<void> {
  if (initialized) return;
  await initializeSchema();
  initialized = true;
}
