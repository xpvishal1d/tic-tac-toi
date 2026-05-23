import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getPool().query("select 1 as ok");
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (error) {
    const response = handleApiError(error);
    const body = await response.json();
    return NextResponse.json(
      { ok: false, database: "error", ...body },
      { status: response.status },
    );
  }
}
