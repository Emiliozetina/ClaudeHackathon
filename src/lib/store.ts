import { createSeed, type SeedData } from "@/data/seed";

/**
 * In-memory demo database, shared by every route handler and server action.
 * Kept on globalThis so it survives hot reloads in dev. Resets when the
 * server restarts; swap for a real database later.
 */
export type Store = SeedData;

const globalForStore = globalThis as unknown as {
  __store?: Store;
  __idCounter?: number;
};

export const store: Store = (globalForStore.__store ??= createSeed());

export function newId(prefix: string): string {
  globalForStore.__idCounter = (globalForStore.__idCounter ?? 0) + 1;
  return `${prefix}-${Date.now().toString(36)}${globalForStore.__idCounter}`;
}
