"use server";

// TEMP: demo-only "act as" switcher until #1 ships real login.

import { cookies } from "next/headers";
import { refresh, revalidatePath } from "next/cache";

import { DEMO_USER_COOKIE, demoAuthEnabled, signOut } from "@/lib/auth";

export async function switchDemoUser(formData: FormData) {
  if (!demoAuthEnabled()) return;
  const userId = String(formData.get("userId") ?? "");
  await signOut();
  (await cookies()).set(DEMO_USER_COOKIE, userId, { path: "/", httpOnly: true, sameSite: "lax" });
  revalidatePath("/", "layout");
  // revalidatePath alone does not re-render the page the switch was made on
  // (the bar and page content kept showing the old user until a reload), so
  // refresh the client router as well.
  refresh();
}
