import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long.")
      .max(120, "Name must be 120 characters or fewer."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const saveGameSchema = z.object({
  result: z.enum(["win", "loss", "draw"]),
  playerSymbol: z.enum(["X", "O"]),
  finalBoard: z
    .array(z.union([z.literal("X"), z.literal("O"), z.null()]))
    .length(9),
});

export function getValidationError(error: z.ZodError) {
  const flattened = error.flatten();
  const firstFieldError = Object.values(flattened.fieldErrors)
    .flat()
    .find(Boolean);

  return {
    message: firstFieldError ?? "Please check the highlighted fields.",
    errors: flattened.fieldErrors,
  };
}
