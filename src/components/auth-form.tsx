"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthResponse = {
  message?: string;
  user?: { role?: string };
  errors?: Record<string, string[] | undefined>;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            confirmPassword: String(formData.get("confirmPassword") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    startTransition(async () => {
      setError("");
      setFieldErrors({});

      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as AuthResponse | null;

      if (!response.ok) {
        setError(data?.message ?? "Something went wrong.");
        setFieldErrors(data?.errors ?? {});
        return;
      }

      const destination = data?.user?.role === "admin" ? "/admin" : "/play";
      router.push(destination);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/78 p-8 shadow-panel backdrop-blur md:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cerulean">
          {mode === "login" ? "Welcome back" : "Create account"}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold text-deep-space-blue">
          {mode === "login" ? "Login to keep playing." : "Join the arena."}
        </h1>
        <p className="mt-3 max-w-md text-base leading-7 text-deep-space-blue/72">
          {mode === "login"
            ? "Access your saved tic-tac-toe results and continue tracking your match history."
            : "Register as a player, save your game outcomes, and unlock your personal game history instantly."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-deep-space-blue">Name</span>
            <input
              name="name"
              required
              minLength={2}
              className="w-full rounded-2xl border border-deep-space-blue/12 bg-white px-4 py-3 text-base text-deep-space-blue outline-none transition focus:border-cerulean"
              placeholder="Your name"
            />
            {fieldErrors.name?.[0] ? (
              <span className="mt-2 block text-sm text-rose-700">{fieldErrors.name[0]}</span>
            ) : null}
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-deep-space-blue">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-deep-space-blue/12 bg-white px-4 py-3 text-base text-deep-space-blue outline-none transition focus:border-cerulean"
            placeholder="you@example.com"
          />
          {fieldErrors.email?.[0] ? (
            <span className="mt-2 block text-sm text-rose-700">{fieldErrors.email[0]}</span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-deep-space-blue">Password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-deep-space-blue/12 bg-white px-4 py-1 focus-within:border-cerulean">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className="w-full border-0 bg-transparent py-2 text-base text-deep-space-blue outline-none"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-sm font-semibold text-cerulean"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password?.[0] ? (
            <span className="mt-2 block text-sm text-rose-700">{fieldErrors.password[0]}</span>
          ) : null}
        </label>

        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-deep-space-blue">
              Confirm password
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-deep-space-blue/12 bg-white px-4 py-1 focus-within:border-cerulean">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full border-0 bg-transparent py-2 text-base text-deep-space-blue outline-none"
                placeholder="Repeat your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="text-sm font-semibold text-cerulean"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.confirmPassword?.[0] ? (
              <span className="mt-2 block text-sm text-rose-700">
                {fieldErrors.confirmPassword[0]}
              </span>
            ) : null}
          </label>
        ) : null}

        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-deep-space-blue px-5 py-3 text-base font-semibold text-white transition hover:bg-cerulean disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending
            ? mode === "login"
              ? "Logging in..."
              : "Creating account..."
            : mode === "login"
              ? "Login"
              : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-deep-space-blue/72">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-semibold text-cerulean hover:text-deep-space-blue"
        >
          {mode === "login" ? "Register here" : "Login here"}
        </Link>
      </p>
    </div>
  );
}
