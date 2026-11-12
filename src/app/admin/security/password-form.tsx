"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";
import type { FormActionState } from "@/app/admin/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {} as FormActionState);
  return (
    <form action={action} className="admin-card admin-security-form">
      <div className="admin-card-heading">
        <h2>Change password</h2>
        <span>All active sessions are invalidated after a change</span>
      </div>
      <div className="admin-card-body admin-auth-form">
        <label>
          Current password
          <input autoComplete="current-password" name="currentPassword" required type="password" />
        </label>
        <label>
          New password
          <input autoComplete="new-password" minLength={14} name="newPassword" required type="password" />
          <small>Use at least 14 characters.</small>
        </label>
        <label>
          Confirm new password
          <input autoComplete="new-password" minLength={14} name="confirmPassword" required type="password" />
        </label>
        {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
        {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
        <button className="admin-button admin-button-primary" disabled={pending} type="submit">
          {pending ? "Updating..." : "Change password"}
        </button>
      </div>
    </form>
  );
}
