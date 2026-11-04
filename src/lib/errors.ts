/** Domain errors thrown by src/lib; api.ts maps them to HTTP status codes. */
export type DomainErrorCode = "bad_request" | "unauthorized" | "forbidden" | "not_found";

export class DomainError extends Error {
  constructor(
    public code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const badRequest = (message: string) => new DomainError("bad_request", message);
export const unauthorized = (message = "Sign in required.") =>
  new DomainError("unauthorized", message);
export const forbidden = (message = "You are not part of this engagement.") =>
  new DomainError("forbidden", message);
export const notFound = (what: string) => new DomainError("not_found", `${what} not found.`);
