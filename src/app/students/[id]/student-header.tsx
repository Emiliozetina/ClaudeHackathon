import { HeaderForUser, initialsOf } from "@/components/layout/CurrentUserHeader";
import type { User } from "@/types";

export { initialsOf };

/** App header for the signed-in (demo) user, business or student. */
export function HeaderFor({ user }: { user: User }) {
  return <HeaderForUser user={user} />;
}
