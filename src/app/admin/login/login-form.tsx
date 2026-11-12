"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="admin-auth-form">
      <label>
        Email address
        <input autoComplete="username" name="email" required type="email" />
      </label>
      <label>
        Password
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
