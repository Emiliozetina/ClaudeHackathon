import { handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { listThreadsForUser } from "@/lib/messages";

export async function GET() {
  return handle(async () => listThreadsForUser(await getCurrentUser()));
}
