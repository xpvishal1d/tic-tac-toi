import { NextResponse } from "next/server";

import { getAdminStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  }

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
