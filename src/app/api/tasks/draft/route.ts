import { draftTask } from "@/lib/task-builder";

/**
 * POST /api/tasks/draft  { description: string }
 * Returns a task draft for "07a · Post a task — describe it, Claude drafts it".
 * Nothing is saved; the business reviews the draft on /tasks/new before publishing.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (description.length < 10 || description.length > 2000) {
    return Response.json(
      { error: { message: "Describe the task in 10 to 2,000 characters." } },
      { status: 400 },
    );
  }
  const draft = await draftTask(description);
  return Response.json({ data: draft });
}
