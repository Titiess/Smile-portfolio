"use client";

import { useActionState } from "react";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/admin/auth-actions";

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, {});
  return (
    <form action={action} className="admin-auth-form">
      <label>
        Administrator email
        <input autoComplete="email" name="email" required type="email" />
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {});
  return (
    <form action={action} className="admin-auth-form">
      <input name="token" type="hidden" value={token} />
      <label>
        New password
        <input autoComplete="new-password" minLength={14} name="password" required type="password" />
        <small>Use at least 14 characters.</small>
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
