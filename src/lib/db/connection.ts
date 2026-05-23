import type { PoolConfig } from "pg";

function normalizeDatabaseUrl(connectionString: string) {
  return connectionString.replace(/^postgres:\/\//, "postgresql://");
}

export function parseDatabaseUrl(connectionString: string) {
  const normalized = normalizeDatabaseUrl(connectionString.trim());

  if (!normalized.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL must start with postgres:// or postgresql:// (copy the full string from DigitalOcean).",
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. If your password contains @, #, or /, URL-encode it (for example @ becomes %40).",
    );
  }

  if (!parsed.hostname) {
    throw new Error("DATABASE_URL is missing a hostname.");
  }

  if (parsed.hostname === "base") {
    throw new Error(
      'DATABASE_URL hostname "base" looks wrong — the URL was likely cut off or the password contains "@" without encoding. Paste the full DigitalOcean connection string and URL-encode special characters in the password (@ → %40).',
    );
  }

  return parsed;
}

export function databaseNeedsSsl(connectionString: string) {
  const parsed = parseDatabaseUrl(connectionString);
  const sslMode = parsed.searchParams.get("sslmode");

  return (
    sslMode === "require" ||
    sslMode === "verify-ca" ||
    sslMode === "verify-full" ||
    parsed.hostname.endsWith(".db.ondigitalocean.com")
  );
}

export function getPoolConfig(connectionString: string): PoolConfig {
  const trimmed = connectionString.trim();
  const needsSsl = databaseNeedsSsl(trimmed);
  const parsed = parseDatabaseUrl(trimmed);

  // pg v8 treats sslmode=require in the URL as strict certificate verification.
  // DigitalOcean uses a managed cert; configure TLS through Pool.ssl instead.
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("sslrootcert");

  const connectionStringWithoutSslParams = parsed
    .toString()
    .replace(/^postgresql:\/\//, "postgres://");

  const isServerless = Boolean(process.env.VERCEL);

  return {
    connectionString: connectionStringWithoutSslParams,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: isServerless ? 1 : 10,
    idleTimeoutMillis: isServerless ? 5_000 : 30_000,
    connectionTimeoutMillis: 15_000,
  };
}
