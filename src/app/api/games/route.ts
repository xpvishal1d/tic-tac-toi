import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { saveGameSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  const playerGames = await db.query.games.findMany({
    where: eq(games.playerId, user.id),
    orderBy: desc(games.createdAt),
  });

  return NextResponse.json({ games: playerGames });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = saveGameSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid game result payload." },
      { status: 400 },
    );
  }

  const [game] = await db
    .insert(games)
    .values({
      playerId: user.id,
      result: parsed.data.result,
      playerSymbol: parsed.data.playerSymbol,
      finalBoard: parsed.data.finalBoard,
    })
    .returning();

  return NextResponse.json({ game }, { status: 201 });
}
