// TEMP: demo-only "act as" bar until #1 ships real login. Server Component.
// Rendered once in the root layout so every page (and every API call, which
// reads the same cookie) acts as the same user. Not part of the Figma design.

import { connection } from "next/server";

import { demoAuthEnabled, getCurrentUser, listDemoUsers } from "@/lib/auth";
import { switchDemoUser } from "@/lib/auth-actions";

export async function DemoUserSwitcher() {
  await connection();
  if (!demoAuthEnabled()) return null;
  const current = await getCurrentUser();
  const users = listDemoUsers();

  return (
    <div className="w-full border-b border-border-subtle bg-status-warning-bg px-4 py-2 md:px-[40px]">
      <form action={switchDemoUser} className="flex flex-wrap items-center gap-2 text-sm text-status-warning">
        <label htmlFor="demo-user" className="font-medium">
          Demo mode: acting as
        </label>
        <select
          id="demo-user"
          name="userId"
          defaultValue={current.id}
          className="rounded border border-border-default bg-surface-card px-2 py-1 text-text-primary"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded border border-border-default bg-surface-card px-2 py-1 text-text-primary"
        >
          Switch
        </button>
      </form>
    </div>
  );
}
