/**
 * TEMPORARY dev identities used by the task/application forms until real auth
 * exists. Matches the seed data in `src/data/seed.ts`. Delete once the forms
 * use the logged-in user.
 */
export const DEV_BUSINESS_HEADERS = {
  "x-dev-role": "business",
  "x-dev-profile-id": "biz_1",
} as const;

export const DEV_STUDENT_HEADERS = {
  "x-dev-role": "student",
  "x-dev-profile-id": "stu_1",
} as const;
