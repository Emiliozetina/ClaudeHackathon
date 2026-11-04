import { handle, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getEngagementForUser, markPaid, signOff } from "@/lib/engagements";
import { badRequest } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    return getEngagementForUser(id, await getCurrentUser());
  });
}

export async function PATCH(request: Request, { params }: Context) {
  return handle(async () => {
    const { id } = await params;
    const { action } = await readJson(request);
    const user = await getCurrentUser();
    if (action === "sign_off") return signOff(id, user);
    if (action === "mark_paid") return markPaid(id, user);
    throw badRequest('action must be "sign_off" or "mark_paid".');
  });
}
