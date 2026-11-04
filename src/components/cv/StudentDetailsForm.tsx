"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Select, Stepper } from "@/components/ui";
import { fieldClassName } from "@/components/ui";
import { joinLabels } from "@/lib/cv/prefill";
import {
  AVAILABILITY_OPTIONS,
  GOALS_MAX,
  MOTIVATION_MAX,
  UNIVERSITIES,
  YEARS_OF_STUDY,
  type SaveResult,
  type StudentDetails,
} from "@/lib/cv/types";
import { AiBanner } from "./AiBanner";
import { SkillsEditor } from "./SkillsEditor";
import { WorkHistoryEditor } from "./WorkHistoryEditor";

export interface PrefillInfo {
  fromCv: boolean;
  /** Student-detail fields the CV didn't cover. */
  notFound: string[];
  roles: number;
}

interface Props {
  initialValues: StudentDetails;
  email: string;
  emailVerified: boolean;
  prefill: PrefillInfo;
  /** Called only when the student confirms on the last page. */
  onConfirm: (values: StudentDetails) => Promise<SaveResult>;
  onBack: () => void;
  onPageChange?: (page: 1 | 2) => void;
  confirmLabel?: string;
}

/** Options for a select, keeping a value that isn't in the standard list. */
function withCurrent(options: readonly string[], current: string): string[] {
  return current && !options.includes(current) ? [current, ...options] : [...options];
}

/**
 * "Your student details" (step 2) and "Experience & goals" (step 3) from the
 * NEXA student sign-up, opened pre-filled and fully editable. Nothing is saved
 * until the last button is pressed. Reusable: pass initialValues and onConfirm.
 */
export function StudentDetailsForm({
  initialValues,
  email,
  emailVerified,
  prefill,
  onConfirm,
  onBack,
  onPageChange,
  confirmLabel = "Create my profile",
}: Props) {
  const [values, setValues] = useState<StudentDetails>(initialValues);
  const [page, setPage] = useState<1 | 2>(1);
  const [noExperience, setNoExperience] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof StudentDetails>(key: K, value: StudentDetails[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  function goTo(next: 1 | 2) {
    setPage(next);
    onPageChange?.(next);
  }

  function continueToExperience(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Enter your full name.";
    if (!values.university.trim()) next.university = "Choose your university.";
    if (!values.fieldOfStudy.trim()) next.fieldOfStudy = "Enter your field of study.";
    setErrors(next);
    if (Object.keys(next).length === 0) goTo(2);
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (values.workHistory.length === 0 && !noExperience) {
      setErrors({ workHistory: "Add a role, or tick the box if you don’t have work experience yet." });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const result = await onConfirm(values);
      if (!result.ok) {
        setFormError(result.error);
        const fieldErrors = result.fieldErrors ?? {};
        setErrors(fieldErrors);
        // Send them back to the page with the problem.
        if (["name", "university", "fieldOfStudy", "yearOfStudy", "availability", "skills"].some((k) => fieldErrors[k])) {
          goTo(1);
        }
      }
    } catch {
      setFormError("Couldn’t save your details. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (page === 1) {
    const missing = prefill.notFound;
    return (
      <form onSubmit={continueToExperience} className="flex flex-col gap-5" noValidate>
        <Stepper current={2} />
        <div className="flex flex-col gap-2">
          <h1 className="type-h2 text-text-primary">Your student details</h1>
          <p className="type-body text-text-secondary">Businesses see this on your profile when you apply.</p>
        </div>

        {prefill.fromCv && (
          <AiBanner title="Pre-filled from your CV">
            {missing.length === 0
              ? "Claude filled in everything it found. Check it all looks right before you continue."
              : `Claude filled the fields it could find. ${joinLabels(missing)} ${
                  missing.length === 1 ? "wasn’t" : "weren’t"
                } on your CV, so please add ${missing.length === 1 ? "it" : "them"}.`}
          </AiBanner>
        )}

        <Input
          label="Full name"
          value={values.name}
          autoComplete="name"
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <Input
          label="University email"
          value={email}
          readOnly
          hint={emailVerified ? <span className="text-status-success">✓ Verified .ac.uk address</span> : undefined}
        />
        <div className="flex flex-col gap-5 sm:flex-row">
          <Select
            label="University"
            value={values.university}
            error={errors.university}
            onChange={(e) => set("university", e.target.value)}
          >
            <option value="">Select your university</option>
            {withCurrent(UNIVERSITIES, values.university).map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
          <Input
            label="Field of study"
            value={values.fieldOfStudy}
            error={errors.fieldOfStudy}
            onChange={(e) => set("fieldOfStudy", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-5 sm:flex-row">
          <Select
            label="Year of study"
            value={values.yearOfStudy}
            error={errors.yearOfStudy}
            onChange={(e) => set("yearOfStudy", e.target.value)}
          >
            <option value="">Select your year</option>
            {withCurrent(YEARS_OF_STUDY, values.yearOfStudy).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </Select>
          <Select
            label="Weekly availability"
            value={values.availability}
            error={errors.availability}
            onChange={(e) => set("availability", e.target.value)}
          >
            <option value="">Select your availability</option>
            {withCurrent(AVAILABILITY_OPTIONS, values.availability).map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
        </div>

        <SkillsEditor skills={values.skills} onChange={(skills) => set("skills", skills)} error={errors.skills} />

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg" showArrow className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={confirm} className="flex flex-col gap-5" noValidate>
      <Stepper current={3} />
      <div className="flex flex-col gap-2">
        <h1 className="type-h2 text-text-primary">Experience &amp; goals</h1>
        <p className="type-body text-text-secondary">Tell businesses about your work history and what motivates you.</p>
      </div>

      {prefill.fromCv && (
        <AiBanner title="Work history pre-filled from your CV">
          {prefill.roles > 0
            ? `Claude found ${prefill.roles} ${prefill.roles === 1 ? "role" : "roles"}. Check them, then add your motivation in your own words.`
            : "Claude didn’t find any roles on your CV. Add them below, or tick the box if you don’t have any yet."}
        </AiBanner>
      )}

      <WorkHistoryEditor
        roles={values.workHistory}
        onChange={(roles) => set("workHistory", roles)}
        noExperience={noExperience}
        onNoExperienceChange={setNoExperience}
        error={errors.workHistory}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cv-motivation" className="type-label text-text-primary">
          Motivation
        </label>
        <div className={fieldClassName(Boolean(errors.motivations))}>
          <textarea
            id="cv-motivation"
            rows={4}
            maxLength={MOTIVATION_MAX}
            value={values.motivations}
            onChange={(e) => set("motivations", e.target.value)}
            className="type-body w-full resize-none bg-transparent text-text-primary outline-none"
          />
        </div>
        <div className="flex justify-between gap-3">
          <p className={errors.motivations ? "type-caption text-status-error" : "type-caption text-text-secondary"}>
            {errors.motivations ?? "Why do you want to work with local businesses?"}
          </p>
          <p className="type-caption text-text-secondary">
            {values.motivations.length} / {MOTIVATION_MAX}
          </p>
        </div>
      </div>

      <Input
        label="Career goal"
        value={values.goals}
        maxLength={GOALS_MAX}
        hint="We use this to recommend tasks that build towards it."
        error={errors.goals}
        onChange={(e) => set("goals", e.target.value)}
      />

      {formError && (
        <p role="alert" className="type-body-sm rounded-md bg-status-error-bg p-3 text-status-error">
          {formError}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => goTo(1)}>
          Back
        </Button>
        <Button type="submit" size="lg" showArrow className="flex-1" disabled={busy}>
          {busy ? "Saving…" : confirmLabel}
        </Button>
      </div>
    </form>
  );
}
