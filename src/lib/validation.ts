import type {
  Business,
  Payment,
  PaymentType,
  Role,
  Student,
  Task,
  WorkHistoryItem,
} from "@/types";

export interface Parsed<T> {
  value?: T;
  errors: string[];
}

export type TaskInput = Pick<
  Task,
  | "title"
  | "description"
  | "startDate"
  | "endDate"
  | "estimatedHours"
  | "requirements"
  | "preferredExperience"
  | "payment"
  | "location"
  | "remote"
>;

const isDate = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}/.test(v) &&
  !Number.isNaN(Date.parse(v));

function stringList(v: unknown, field: string, errors: string[]): string[] {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) {
    errors.push(`${field} must be a list of strings`);
    return [];
  }
  return v.map((x: string) => x.trim()).filter(Boolean);
}

/** Validates the body for creating a task (all required fields present). */
export function parseTaskInput(body: Record<string, unknown>): Parsed<TaskInput> {
  const errors: string[] = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length < 3 || title.length > 120)
    errors.push("title must be 3-120 characters");

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 10 || description.length > 5000)
    errors.push("description must be 10-5000 characters");

  if (!isDate(body.startDate)) errors.push("startDate must be a date (YYYY-MM-DD)");
  if (!isDate(body.endDate)) errors.push("endDate must be a date (YYYY-MM-DD)");
  if (
    isDate(body.startDate) &&
    isDate(body.endDate) &&
    Date.parse(body.endDate) < Date.parse(body.startDate)
  )
    errors.push("endDate must not be before startDate");

  let estimatedHours: number | undefined;
  if (body.estimatedHours !== undefined && body.estimatedHours !== null) {
    if (
      typeof body.estimatedHours !== "number" ||
      !(body.estimatedHours > 0) ||
      body.estimatedHours > 1000
    )
      errors.push("estimatedHours must be a positive number");
    else estimatedHours = body.estimatedHours;
  }

  const requirements = stringList(body.requirements, "requirements", errors);
  if (requirements.length === 0)
    errors.push("requirements needs at least one entry");
  const preferredExperience = stringList(
    body.preferredExperience,
    "preferredExperience",
    errors,
  );

  const payment = parsePayment(body.payment, errors);

  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  if (!location) errors.push("location is required");

  const remote = body.remote === undefined ? false : body.remote;
  if (typeof remote !== "boolean") errors.push("remote must be true or false");

  if (errors.length > 0) return { errors };
  return {
    errors,
    value: {
      title,
      description,
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      estimatedHours,
      requirements,
      preferredExperience,
      payment: payment as Payment,
      location,
      remote: remote as boolean,
    },
  };
}

function parsePayment(v: unknown, errors: string[]): Payment | undefined {
  if (!v || typeof v !== "object") {
    errors.push("payment is required");
    return undefined;
  }
  const p = v as Record<string, unknown>;
  const types: PaymentType[] = ["fixed", "hourly"];
  if (!types.includes(p.type as PaymentType))
    errors.push("payment.type must be 'fixed' or 'hourly'");
  if (typeof p.amount !== "number" || !(p.amount > 0) || p.amount > 100000)
    errors.push("payment.amount must be a positive number");
  if (p.notes !== undefined && (typeof p.notes !== "string" || p.notes.length > 500))
    errors.push("payment.notes must be text up to 500 characters");
  if (errors.some((e) => e.startsWith("payment"))) return undefined;
  return {
    type: p.type as PaymentType,
    amount: p.amount as number,
    currency: "GBP",
    notes: typeof p.notes === "string" ? p.notes.trim() || undefined : undefined,
  };
}

// -------------------- Auth & profiles --------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmail(v: unknown, errors: string[]): string {
  if (typeof v !== "string" || !EMAIL_RE.test(v.trim())) {
    errors.push("email must be a valid email address");
    return "";
  }
  return v.trim().toLowerCase();
}

function parsePassword(v: unknown, errors: string[]): string {
  if (typeof v !== "string" || v.length < 8 || v.length > 200) {
    errors.push("password must be 8-200 characters");
    return "";
  }
  return v;
}

function parseText(
  v: unknown,
  field: string,
  min: number,
  max: number,
  errors: string[],
): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (s.length < min || s.length > max) {
    errors.push(`${field} must be ${min}-${max} characters`);
    return "";
  }
  return s;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function parseLogin(body: Record<string, unknown>): Parsed<LoginInput> {
  const errors: string[] = [];
  const email = parseEmail(body.email, errors);
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) errors.push("password is required");
  if (errors.length) return { errors };
  return { errors, value: { email, password } };
}

export type RegisterBusinessInput = {
  email: string;
  password: string;
  role: "business";
  profile: Pick<Business, "name" | "about" | "location" | "website">;
};

export type RegisterStudentInput = {
  email: string;
  password: string;
  role: "student";
  profile: Pick<
    Student,
    | "name"
    | "university"
    | "fieldOfStudy"
    | "skills"
    | "workHistory"
    | "motivations"
    | "goals"
    | "availability"
    | "cvUrl"
  >;
};

export type RegisterInput = RegisterBusinessInput | RegisterStudentInput;

export function parseRegister(body: Record<string, unknown>): Parsed<RegisterInput> {
  const errors: string[] = [];
  const role = body.role as Role;
  if (role !== "business" && role !== "student") {
    return { errors: ["role must be 'business' or 'student'"] };
  }
  const email = parseEmail(body.email, errors);
  const password = parsePassword(body.password, errors);

  if (role === "business") {
    const profile = parseBusinessProfileBody(body.profile, errors);
    if (errors.length || !profile) return { errors };
    return { errors, value: { role, email, password, profile } };
  }

  const profile = parseStudentProfileBody(body.profile, errors);
  if (errors.length || !profile) return { errors };
  return { errors, value: { role, email, password, profile } };
}

export type BusinessProfileInput = Pick<
  Business,
  "name" | "about" | "location" | "website"
>;

function parseBusinessProfileBody(
  raw: unknown,
  errors: string[],
): BusinessProfileInput | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    errors.push("profile is required");
    return undefined;
  }
  const p = raw as Record<string, unknown>;
  const name = parseText(p.name, "profile.name", 2, 120, errors);
  const about = parseText(p.about, "profile.about", 10, 2000, errors);
  const location = parseText(p.location, "profile.location", 2, 120, errors);
  let website: string | undefined;
  if (p.website !== undefined && p.website !== "") {
    if (typeof p.website !== "string" || p.website.length > 500) {
      errors.push("profile.website must be text up to 500 characters");
    } else {
      website = p.website.trim();
    }
  }
  if (errors.some((e) => e.startsWith("profile"))) return undefined;
  return { name, about, location, website };
}

export function parseBusinessProfile(
  body: Record<string, unknown>,
): Parsed<BusinessProfileInput> {
  const errors: string[] = [];
  const profile = parseBusinessProfileBody(body, errors);
  if (!profile) return { errors };
  return { errors, value: profile };
}

export type StudentProfileInput = Pick<
  Student,
  | "name"
  | "university"
  | "fieldOfStudy"
  | "skills"
  | "workHistory"
  | "motivations"
  | "goals"
  | "availability"
  | "cvUrl"
>;

function parseWorkHistory(
  v: unknown,
  errors: string[],
): WorkHistoryItem[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) {
    errors.push("profile.workHistory must be a list");
    return [];
  }
  const out: WorkHistoryItem[] = [];
  v.forEach((item, i) => {
    if (!item || typeof item !== "object") {
      errors.push(`profile.workHistory[${i}] must be an object`);
      return;
    }
    const r = item as Record<string, unknown>;
    const title = typeof r.title === "string" ? r.title.trim() : "";
    const organisation =
      typeof r.organisation === "string" ? r.organisation.trim() : "";
    const startDate = typeof r.startDate === "string" ? r.startDate : "";
    if (!title || !organisation || !startDate) {
      errors.push(
        `profile.workHistory[${i}] needs title, organisation and startDate`,
      );
      return;
    }
    const endDate =
      typeof r.endDate === "string" && r.endDate ? r.endDate : undefined;
    const description =
      typeof r.description === "string" && r.description
        ? r.description.trim()
        : undefined;
    const id = typeof r.id === "string" && r.id ? r.id : `wh_${i}_${Date.now()}`;
    out.push({ id, title, organisation, startDate, endDate, description });
  });
  return out;
}

function parseStudentProfileBody(
  raw: unknown,
  errors: string[],
): StudentProfileInput | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    errors.push("profile is required");
    return undefined;
  }
  const p = raw as Record<string, unknown>;
  const name = parseText(p.name, "profile.name", 2, 120, errors);
  const university = parseText(p.university, "profile.university", 2, 200, errors);
  const fieldOfStudy = parseText(
    p.fieldOfStudy,
    "profile.fieldOfStudy",
    2,
    200,
    errors,
  );
  const motivations = parseText(
    p.motivations,
    "profile.motivations",
    5,
    2000,
    errors,
  );
  const goals = parseText(p.goals, "profile.goals", 5, 2000, errors);
  const skills = stringList(p.skills, "profile.skills", errors);
  const workHistory = parseWorkHistory(p.workHistory, errors);
  const availability =
    typeof p.availability === "string" && p.availability
      ? p.availability.trim()
      : undefined;
  const cvUrl =
    typeof p.cvUrl === "string" && p.cvUrl ? p.cvUrl.trim() : undefined;
  if (errors.some((e) => e.startsWith("profile"))) return undefined;
  return {
    name,
    university,
    fieldOfStudy,
    skills,
    workHistory,
    motivations,
    goals,
    availability,
    cvUrl,
  };
}

export function parseStudentProfile(
  body: Record<string, unknown>,
): Parsed<StudentProfileInput> {
  const errors: string[] = [];
  const profile = parseStudentProfileBody(body, errors);
  if (!profile) return { errors };
  return { errors, value: profile };
}

