import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAllowedOrigin, handleCorsPreflight } from "@/lib/cors";

export function middleware(request: NextRequest) {
  const preflight = handleCorsPreflight(request);

  if (preflight) {
    return preflight;
  }

  const response = NextResponse.next();
  const allowedOrigin = getAllowedOrigin(request.headers.get("origin"));

  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.append("Vary", "Origin");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
