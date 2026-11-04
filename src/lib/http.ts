import { NextResponse } from "next/server";

/** Small helpers so every route returns errors in the same shape. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(status: number, message: string, details?: string[]) {
  return NextResponse.json({ error: { message, details } }, { status });
}

/** Parses a JSON object body; returns null if the body is missing or not an object. */
export async function readJson(
  req: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
