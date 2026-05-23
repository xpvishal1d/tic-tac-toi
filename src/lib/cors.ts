import type { NextRequest } from "next/server";

const LOCAL_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/;

function getConfiguredOrigins() {
  return (
    process.env.ALLOWED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  );
}

export function getAllowedOrigin(origin: string | null) {
  if (!origin) {
    return null;
  }

  if (getConfiguredOrigins().includes(origin)) {
    return origin;
  }

  if (process.env.NODE_ENV === "development" && LOCAL_DEV_ORIGIN.test(origin)) {
    return origin;
  }

  return null;
}

export function handleCorsPreflight(request: NextRequest) {
  if (request.method !== "OPTIONS") {
    return null;
  }

  const allowedOrigin = getAllowedOrigin(request.headers.get("origin"));

  if (!allowedOrigin) {
    return new Response(null, { status: 204 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        request.headers.get("Access-Control-Request-Headers") ??
        "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

export function withCorsHeaders(request: NextRequest, response: Response) {
  const allowedOrigin = getAllowedOrigin(request.headers.get("origin"));

  if (!allowedOrigin) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.append("Vary", "Origin");

  return response;
}
