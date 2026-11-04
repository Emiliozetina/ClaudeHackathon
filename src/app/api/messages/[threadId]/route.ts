import { handle, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { badRequest } from "@/lib/errors";
import { getThreadForUser, sendMessage } from "@/lib/messages";

type Context = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, { params }: Context) {
  return handle(async () => {
    const { threadId } = await params;
    return getThreadForUser(threadId, await getCurrentUser());
  });
}

export async function POST(request: Request, { params }: Context) {
  return handle(async () => {
    const { threadId } = await params;
    const { body } = await readJson(request);
    if (typeof body !== "string") throw badRequest("body must be a string.");
    const message = sendMessage(threadId, await getCurrentUser(), body);
    return Response.json(message, { status: 201 });
  });
}
