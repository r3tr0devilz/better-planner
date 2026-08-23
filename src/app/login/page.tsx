"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          Better Planner
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Sign in to your dashboard.
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border border-paper-line bg-paper px-3 py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-stamp-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-stamp-red px-4 py-2.5 font-medium text-paper-card transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
