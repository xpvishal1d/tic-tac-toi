import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/lib/env";
import { getPoolConfig } from "@/lib/db/connection";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  pool?: Pool;
  poolKey?: string;
};

function getOrCreatePool() {
  const poolKey = env.DATABASE_URL;

  if (globalForDb.pool && globalForDb.poolKey === poolKey) {
    return globalForDb.pool;
  }

  if (globalForDb.pool) {
    void globalForDb.pool.end().catch(() => undefined);
  }

  const nextPool = new Pool(getPoolConfig(poolKey));
  globalForDb.pool = nextPool;
  globalForDb.poolKey = poolKey;
  return nextPool;
}

export const pool = getOrCreatePool();
export const db = drizzle(pool, { schema });
