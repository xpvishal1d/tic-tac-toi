import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "@/lib/env";
import { getPoolConfig } from "@/lib/db/connection";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  pool?: Pool;
  poolKey?: string;
  db?: Database;
};

function getOrCreatePool() {
  const poolKey = getEnv().DATABASE_URL;

  if (globalForDb.pool && globalForDb.poolKey === poolKey) {
    return globalForDb.pool;
  }

  if (globalForDb.pool) {
    void globalForDb.pool.end().catch(() => undefined);
  }

  const nextPool = new Pool(getPoolConfig(poolKey));
  globalForDb.pool = nextPool;
  globalForDb.poolKey = poolKey;
  globalForDb.db = undefined;
  return nextPool;
}

export function getPool() {
  return getOrCreatePool();
}

export function getDb(): Database {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getPool(), { schema });
  }

  return globalForDb.db;
}

export const pool = new Proxy({} as Pool, {
  get(_target, property, receiver) {
    const value = Reflect.get(getPool() as object, property, receiver);
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const value = Reflect.get(getDb() as object, property, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
