"use client";

import { useActionState } from "react";
import { setupAdminAction } from "@/app/admin/auth-actions";

export function SetupForm() {
  const [state, action, pending] = useActionState(setupAdminAction, {});

  return (
    <form action={action} className="admin-auth-form">
      <label>
        Your name
        <input autoComplete="name" name="name" required />
      </label>
      <label>
        Administrator email
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        Password
        <input autoComplete="new-password" minLength={14} name="password" required type="password" />
        <small>Use at least 14 characters. This is the only initial administrator setup.</small>
      </label>
      <label>
        Setup token
        <input autoComplete="off" name="setupToken" required type="password" />
        <small>Read from the server&apos;s ADMIN_SETUP_TOKEN environment variable.</small>
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Creating account..." : "Create administrator"}
      </button>
    </form>
  );
}
