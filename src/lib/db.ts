/**
 * In-memory store for tasks and applications. This is the same single store
 * that engagements, messages and reviews use (src/lib/store.ts), so choosing
 * an applicant and opening the engagement see the same data. Swap that module
 * for a real database later; the routes only use the exports below.
 */
export { store as db, newId } from "@/lib/store";
