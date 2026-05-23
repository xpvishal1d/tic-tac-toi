import "dotenv/config";

import { z } from "zod";

import { parseDatabaseUrl } from "@/lib/db/connection";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .superRefine((value, context) => {
      try {
        parseDatabaseUrl(value);
      } catch (error) {
        context.addIssue({
          code: "custom",
          message: error instanceof Error ? error.message : "Invalid DATABASE_URL.",
        });
      }
    }),
  JWT_SECRET: z.string().min(12),
  ADMIN_NAME: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
});

export const env = envSchema.parse(process.env);
