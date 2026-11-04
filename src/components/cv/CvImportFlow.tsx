"use client";

import { useState } from "react";
import { Button, Stepper } from "@/components/ui";
import { saveStudentDetails } from "@/app/cv/actions";
import { buildInitialDetails, type InitialDetails } from "@/lib/cv/prefill";
import { CV_MAX_BYTES, type CvParseResult, type StudentDetails } from "@/lib/cv/types";
import { CvFindings } from "./CvFindings";
import { IconShield } from "./CvIcons";
import { CvShell, type CvPanel } from "./CvShell";
import { CvUpload, type UploadState } from "./CvUpload";
import { StudentDetailsForm } from "./StudentDetailsForm";

type Phase = "upload" | "details" | "saved";

interface Props {
  /** The student's current profile, used for anything the CV doesn't cover. */
  profile: StudentDetails;
  email: string;
  emailVerified: boolean;
}

/**
 * The whole CV helper: upload -> "Here's what Claude found" -> editable
 * student details -> confirm. Standalone, so /register/student can reuse the
 * pieces (CvUpload, CvFindings, StudentDetailsForm) later.
 */
export function CvImportFlow({ profile, email, emailVerified }: Props) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const [result, setResult] = useState<CvParseResult | null>(null);
  const [initial, setInitial] = useState<InitialDetails | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [formPage, setFormPage] = useState<1 | 2>(1);
  /** True when the details were pre-filled from a CV (not "fill it in yourself"). */
  const [fromCv, setFromCv] = useState(false);

  async function handleFile(file: File) {
    // Quick checks so the student gets feedback without a round trip. The
    // server checks again (type, size and the PDF header).
    if (file.size > CV_MAX_BYTES) {
      setUpload({ status: "error", message: "Your CV must be 4 MB or smaller." });
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUpload({ status: "error", message: "Please upload your CV as a PDF." });
      return;
    }

    setResult(null);
    setUpload({ status: "reading", fileName: file.name });
    try {
      const body = new FormData();
      body.append("cv", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setUpload({ status: "error", message: json?.error?.message ?? "Something went wrong reading your CV." });
        return;
      }
      setResult(json.data as CvParseResult);
      setUpload({ status: "done", fileName: file.name, size: file.size });
    } catch {
      setUpload({ status: "error", message: "Couldn’t reach the server. Check your connection and try again." });
    }
  }

  function openDetails(fromResult: CvParseResult | null) {
    setInitial(buildInitialDetails(profile, fromResult));
    setFromCv(fromResult !== null);
    setFormKey((k) => k + 1);
    setFormPage(1);
    setPhase("details");
  }

  const panel: CvPanel = phase === "upload" ? "cv" : phase === "saved" || formPage === 1 ? "details" : "experience";

  return (
    <CvShell panel={panel}>
      {phase === "upload" && (
        <div className="flex flex-col gap-5">
          <Stepper current={2} />
          <div className="flex flex-col gap-2">
            <h1 className="type-h2 text-text-primary">Start with your CV</h1>
            <p className="type-body text-text-secondary">
              Claude will read it and pre-fill your details, work history and skills.
            </p>
          </div>

          <CvUpload state={upload} onFile={handleFile} />

          {upload.status === "done" && result && (
            <>
              <CvFindings result={result} />
              <p className="type-caption flex items-start gap-2 text-text-secondary">
                <IconShield className="mt-0.5 size-4 shrink-0" />
                Claude only uses what’s written in your CV. If something looks wrong, you can change it on the next
                screen.
              </p>
            </>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" className="flex-1" href="/dashboard/student/profile">
              Back
            </Button>
            <Button
              size="lg"
              showArrow
              className="flex-1"
              disabled={upload.status !== "done" || !result}
              onClick={() => openDetails(result)}
            >
              Check my details
            </Button>
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => openDetails(null)}>
              No CV? Fill it in yourself
            </Button>
          </div>
        </div>
      )}

      {phase === "details" && initial && (
        <StudentDetailsForm
          key={formKey}
          initialValues={initial.values}
          email={email}
          emailVerified={emailVerified}
          prefill={{ fromCv, notFound: initial.notFound, roles: initial.roles }}
          onPageChange={setFormPage}
          onBack={() => setPhase("upload")}
          onConfirm={async (values) => {
            const outcome = await saveStudentDetails(values);
            if (outcome.ok) setPhase("saved");
            return outcome;
          }}
        />
      )}

      {phase === "saved" && (
        <div className="flex flex-col gap-5">
          <Stepper current={4} steps={["Account", "Details", "Profile"]} />
          <div className="flex flex-col gap-2">
            <h1 className="type-h2 text-text-primary">Your profile is saved</h1>
            <p className="type-body text-text-secondary">
              Businesses will see these details when you apply. You can change them any time.
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" href="/dashboard/student/profile">
              View my profile
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" href="/tasks">
              Browse tasks
            </Button>
          </div>
        </div>
      )}
    </CvShell>
  );
}
