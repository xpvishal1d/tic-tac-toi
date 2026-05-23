import { pool } from "@/lib/db";
import { parseDatabaseUrl } from "@/lib/db/connection";

async function main() {
  const parsed = parseDatabaseUrl(process.env.DATABASE_URL ?? "");
  await pool.query("select 1 as ok");
  console.log(`Database connected: ${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`);
  await pool.end();
}

main().catch((error) => {
  console.error("Database connection failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
