import { fail, ok } from "@/lib/http";
import { CvParseError, parseCv } from "@/lib/cv/parse";
import { CV_MAX_BYTES } from "@/lib/cv/types";
import { validateCvUpload } from "@/lib/cv/validate";
import { getActor } from "@/lib/session";

/**
 * POST /api/cv/parse (multipart form, field "cv" = a PDF up to 4 MB)
 * Students only. Returns what was found in the CV; nothing is saved here and
 * the file itself is never stored.
 *
 * Claude reads the PDF (src/lib/cv/parse.ts). Errors: 500 when reading CVs
 * isn't configured, 502 when Claude fails or refuses.
 */
export async function POST(req: Request) {
  const actor = getActor(req);
  if (!actor) return fail(401, "Not signed in");
  if (actor.role !== "student") return fail(403, "Only students can upload a CV");

  // Cheap early rejection before the body is read (multipart adds some overhead).
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > CV_MAX_BYTES + 64 * 1024) {
    return fail(400, "Your CV must be 4 MB or smaller.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Send the CV as multipart form data.");
  }

  const file = form.get("cv");
  if (!(file instanceof File)) return fail(400, "Attach a PDF in the “cv” field.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const problem = validateCvUpload(file, bytes);
  if (problem) return fail(400, problem);

  try {
    const result = await parseCv({ name: file.name, type: file.type, size: file.size, bytes });
    return ok(result);
  } catch (error) {
    if (error instanceof CvParseError) return fail(error.status, error.message);
    throw error;
  }
}
