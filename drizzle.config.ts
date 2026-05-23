import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { databaseNeedsSsl, parseDatabaseUrl } from "./src/lib/db/connection";

const databaseUrl = process.env.DATABASE_URL ?? "";
const parsed = parseDatabaseUrl(databaseUrl);
const needsSsl = databaseNeedsSsl(databaseUrl);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  },
});
