import { handle, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createEngagementFromApplication, listEngagementsForUser } from "@/lib/engagements";
import { badRequest } from "@/lib/errors";

export async function GET() {
  return handle(async () => listEngagementsForUser(await getCurrentUser()));
}

export async function POST(request: Request) {
  return handle(async () => {
    const { applicationId } = await readJson(request);
    if (typeof applicationId !== "string" || !applicationId) throw badRequest("applicationId is required.");
    const engagement = createEngagementFromApplication(applicationId, await getCurrentUser());
    return Response.json(engagement, { status: 201 });
  });
}
