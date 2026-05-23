import { NextResponse } from "next/server";
import { ZodError } from "zod";

function isPgError(error: unknown): error is { code?: string; message?: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export function handleApiError(error: unknown) {
  console.error("[api]", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message:
          "Server configuration is invalid. Set DATABASE_URL, JWT_SECRET, and admin env vars on Vercel.",
      },
      { status: 500 },
    );
  }

  const pgError = isPgError(error) ? error : isPgError((error as { cause?: unknown })?.cause) ? (error as { cause: { code?: string; message?: string } }).cause : null;

  if (pgError?.code === "42P01") {
    return NextResponse.json(
      {
        message:
          "Database tables are missing. Run npm run db:push locally with your production DATABASE_URL.",
      },
      { status: 503 },
    );
  }

  if (pgError?.code === "28000" || pgError?.code === "28P01") {
    return NextResponse.json(
      { message: "Database authentication failed. Check DATABASE_URL on Vercel." },
      { status: 503 },
    );
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  if (
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEDOUT") ||
    message.includes("Connection terminated")
  ) {
    return NextResponse.json(
      {
        message:
          "Cannot reach the database. In DigitalOcean, add 0.0.0.0/0 under Trusted sources for Vercel serverless.",
      },
      { status: 503 },
    );
  }

  if (message.includes("certificate") || message.includes("SSL")) {
    return NextResponse.json(
      { message: "Database SSL connection failed." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { message: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
