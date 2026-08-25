"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-ink">
          Better Planner
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          Sign in to your dashboard.
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
            Email
            <input name="email" type="email" required autoComplete="email" className="field" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
            Password
            <input name="password" type="password" required autoComplete="current-password" className="field" />
          </label>

          {error && (
            <p role="alert" className="text-sm text-vermillion">
              {error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn mt-2 w-full py-2.5">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <p className="mt-4 max-w-sm text-center text-xs text-ink-faint">
        Private, single-user planner. Your data stays in your own account.
      </p>
    </main>
  );
}
