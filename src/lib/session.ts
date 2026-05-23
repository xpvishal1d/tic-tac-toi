import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionCookieName, verifyToken, type AuthUser } from "@/lib/auth";

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/play");
  }

  return user;
}

export function isAdmin(user: AuthUser | null) {
  return user?.role === "admin";
}
