import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { games, users } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";
import { hashPassword } from "@/lib/auth";

export async function ensureAdminUser() {
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, getEnv().ADMIN_EMAIL),
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  const [admin] = await db
    .insert(users)
    .values({
      name: getEnv().ADMIN_NAME,
      email: getEnv().ADMIN_EMAIL,
      passwordHash: await hashPassword(getEnv().ADMIN_PASSWORD),
      role: "admin",
    })
    .returning();

  return admin;
}

export async function getAdminStats() {
  const [playerCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "player"));

  const [gameCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(games);

  const resultSummary = await db
    .select({
      result: games.result,
      count: sql<number>`count(*)`,
    })
    .from(games)
    .groupBy(games.result);

  const recentGames = await db
    .select({
      id: games.id,
      result: games.result,
      playerSymbol: games.playerSymbol,
      createdAt: games.createdAt,
      playerName: users.name,
      playerEmail: users.email,
    })
    .from(games)
    .innerJoin(users, eq(games.playerId, users.id))
    .orderBy(desc(games.createdAt))
    .limit(8);

  return {
    totalPlayers: Number(playerCountResult?.count ?? 0),
    totalGames: Number(gameCountResult?.count ?? 0),
    results: resultSummary.map((item) => ({
      result: item.result,
      count: Number(item.count),
    })),
    recentGames,
  };
}
