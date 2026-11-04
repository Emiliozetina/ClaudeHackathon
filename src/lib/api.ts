import { DomainError } from "@/lib/errors";

const STATUS: Record<DomainError["code"], number> = {
  bad_request: 400,
  forbidden: 403,
  not_found: 404,
};

/** Run a route handler body and turn DomainErrors into JSON error responses. */
export async function handle(fn: () => unknown | Promise<unknown>): Promise<Response> {
  try {
    const result = await fn();
    return result instanceof Response ? result : Response.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return Response.json({ error: error.message }, { status: STATUS[error.code] });
    }
    throw error;
  }
}

/** Parse a JSON body as a plain object, or fail with a 400. */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new DomainError("bad_request", "Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}
