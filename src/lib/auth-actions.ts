"use server";

// TEMP: demo-only "act as" switcher until #1 ships real login.

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { DEMO_USER_COOKIE, demoAuthEnabled } from "@/lib/auth";

export async function switchDemoUser(formData: FormData) {
  if (!demoAuthEnabled()) return;
  const userId = String(formData.get("userId") ?? "");
  (await cookies()).set(DEMO_USER_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax" });
  revalidatePath("/", "layout");
}
