import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { getEnv } from "@/lib/env";
import type { User } from "@/lib/db/schema";

export type AuthUser = Pick<User, "id" | "name" | "email" | "role">;

const SESSION_COOKIE = "tic-tac-toi-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionMaxAge() {
  return SESSION_MAX_AGE;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, getEnv().JWT_SECRET, { expiresIn: `${SESSION_MAX_AGE}s` });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getEnv().JWT_SECRET) as AuthUser;
}
