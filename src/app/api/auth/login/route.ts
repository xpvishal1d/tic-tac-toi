import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  comparePassword,
  getSessionCookieName,
  getSessionMaxAge,
  signToken,
  toAuthUser,
} from "@/lib/auth";
import { ensureAdminUser } from "@/lib/data";
import { getValidationError, loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureAdminUser();

  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(getValidationError(parsed.error), { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const matches = await comparePassword(parsed.data.password, user.passwordHash);

  if (!matches) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const authUser = toAuthUser(user);
  const response = NextResponse.json({ user: authUser });
  response.cookies.set({
    name: getSessionCookieName(),
    value: signToken(authUser),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAge(),
  });

  return response;
}
