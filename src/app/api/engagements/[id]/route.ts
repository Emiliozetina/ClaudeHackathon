import { handle, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import {
  addMilestone,
  getEngagementForUser,
  logHours,
  markComplete,
  payAndReview,
  requestChanges,
  toggleMilestone,
} from "@/lib/engagements";
import { badRequest } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

const ACTIONS = ["log_hours", "add_milestone", "toggle_milestone", "mark_complete", "request_changes", "pay_and_review"];

function readString(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string") throw badRequest(`${field} must be a string.`);
  return value;
}

function readNumber(body: Record<string, unknown>, field: string): number {
  const value = body[field];
  if (typeof value !== "number" || !Number.isFinite(value)) throw badRequest(`${field} must be a number.`);
  return value;
}

function readTags(body: Record<string, unknown>): string[] {
  const { tags = [] } = body;
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
    throw badRequest("tags must be an array of strings.");
  }
  return tags;
}

export async function GET(_request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    return getEngagementForUser(id, await getCurrentUser());
  });
}

export async function PATCH(request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const user = await getCurrentUser();
    switch (body.action) {
      case "log_hours":
        return logHours(id, user, readNumber(body, "hours"));
      case "add_milestone":
        return addMilestone(id, user, readString(body, "title"));
      case "toggle_milestone":
        return toggleMilestone(id, user, readString(body, "milestoneId"));
      case "mark_complete":
        return markComplete(id, user);
      case "request_changes":
        return requestChanges(id, user, readString(body, "note"));
      case "pay_and_review": {
        const { verifiedReference } = body;
        if (verifiedReference !== undefined && typeof verifiedReference !== "boolean") {
          throw badRequest("verifiedReference must be a boolean.");
        }
        return payAndReview(id, user, {
          rating: readNumber(body, "rating"),
          tags: readTags(body),
          comment: readString(body, "comment"),
          verifiedReference,
        });
      }
      default:
        throw badRequest(`action must be one of: ${ACTIONS.join(", ")}.`);
    }
  });
}
