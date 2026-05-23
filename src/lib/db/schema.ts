import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["player", "admin"]);
export const gameResultEnum = pgEnum("game_result", ["win", "loss", "draw"]);
export const playerSymbolEnum = pgEnum("player_symbol", ["X", "O"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("player"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  result: gameResultEnum("result").notNull(),
  playerSymbol: playerSymbolEnum("player_symbol").notNull(),
  finalBoard: jsonb("final_board").$type<Array<"X" | "O" | null>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Game = InferSelectModel<typeof games>;
export type NewGame = InferInsertModel<typeof games>;
