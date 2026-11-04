import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type NavLinkProps = {
  href: string;
  active?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Figma: Design system → Components → Nav link (4:8).
 * Active: teal-700 text with a 2px teal-700 bottom border.
 */
export function NavLink({ href, active = false, className, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "type-label flex flex-col items-center whitespace-nowrap px-[4px] py-[24px]",
        active
          ? "border-b-2 border-teal-700 text-teal-700"
          : "text-text-secondary hover:text-text-primary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
