"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      setError("");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setError("Could not log out right now.");
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="rounded-full border border-deep-space-blue/15 bg-white px-4 py-2 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Signing out..." : "Logout"}
      </button>
    </div>
  );
}
