import { dayOf, todayUtc } from "@/lib/dates";
import type { Payment, PaymentType, Task } from "@/types";

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

export interface TaskInputOptions {
  /** Reject a startDate before today (when posting, or when the date is changed). */
  requireFutureStart?: boolean;
}

/** Validates the body for creating a task (all required fields present). */
export function parseTaskInput(
  body: Record<string, unknown>,
  options: TaskInputOptions = {},
): Parsed<TaskInput> {
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
  if (
    options.requireFutureStart &&
    isDate(body.startDate) &&
    dayOf(body.startDate) < todayUtc()
  )
    errors.push("startDate can't be in the past");

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
