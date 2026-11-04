import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getEngagementForUser, type EngagementView } from "@/lib/engagements";
import { DomainError } from "@/lib/errors";
import type { User } from "@/types";

export type LoadedEngagement = { user: User; engagement: EngagementView } | { forbidden: true };

/**
 * Loads an engagement for the signed-in user. Reads cookies, so call it only
 * from a component inside a Suspense boundary. Unknown ids go to the 404 page.
 */
export async function loadEngagement(id: string): Promise<LoadedEngagement> {
  const user = await requireUser();
  try {
    return { user, engagement: getEngagementForUser(id, user) };
  } catch (error) {
    if (error instanceof DomainError && error.code === "not_found") notFound();
    if (error instanceof DomainError && error.code === "forbidden") return { forbidden: true };
    throw error;
  }
}
