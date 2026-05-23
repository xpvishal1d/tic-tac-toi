import Link from "next/link";

import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

type SiteHeaderProps = {
  user: AuthUser | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-deep-space-blue text-lg font-bold text-white shadow-panel">
          TT
        </span>
        <div>
          <p className="font-heading text-xl font-bold text-deep-space-blue">Tic Tac Toi</p>
          <p className="text-sm text-deep-space-blue/70">Next.js full-stack game studio</p>
        </div>
      </Link>

      <nav className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/play"
          className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
        >
          Play
        </Link>
        {user?.role === "admin" ? (
          <Link
            href="/admin"
            className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
          >
            Admin
          </Link>
        ) : null}
        {user ? (
          <>
            <div className="rounded-full bg-frosted-blue/55 px-4 py-2 text-sm font-semibold text-deep-space-blue">
              {user.name}
            </div>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full border border-deep-space-blue/15 bg-white px-4 py-2 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-deep-space-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cerulean"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
