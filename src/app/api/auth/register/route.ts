import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  getSessionCookieName,
  getSessionMaxAge,
  hashPassword,
  signToken,
  toAuthUser,
} from "@/lib/auth";
import { getValidationError, registerSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(getValidationError(parsed.error), { status: 400 });
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Email already registered." },
      { status: 409 },
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    })
    .returning();

  const authUser = toAuthUser(user);
  const response = NextResponse.json({ user: authUser }, { status: 201 });
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
