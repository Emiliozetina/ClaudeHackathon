// TEMP: demo-only "act as" control until #1 ships real login. Server Component.

import { connection } from "next/server";

import { demoAuthEnabled, getCurrentUser, listDemoUsers } from "@/lib/auth";
import { switchDemoUser } from "@/lib/auth-actions";

export async function DemoUserSwitcher() {
  await connection();
  if (!demoAuthEnabled()) return null;
  const current = await getCurrentUser();
  const users = listDemoUsers();

  return (
    <form action={switchDemoUser} className="flex items-center gap-2 text-sm">
      <label htmlFor="demo-user" className="text-black/60 dark:text-white/60">
        Demo: acting as
      </label>
      <select
        id="demo-user"
        name="userId"
        defaultValue={current.id}
        className="rounded border border-black/20 bg-transparent px-2 py-1 dark:border-white/20"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
      <button type="submit" className="rounded border border-black/20 px-2 py-1 dark:border-white/20">
        Switch
      </button>
    </form>
  );
}
