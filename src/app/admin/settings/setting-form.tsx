"use client";

import { useActionState } from "react";
import { updateSiteSetting } from "@/app/admin/actions";
import type { FormActionState } from "@/app/admin/actions";

export function SettingForm({
  settingKey,
  label,
  value,
  type = "text",
  help,
}: {
  settingKey: "site-title" | "site-description" | "contact-email";
  label: string;
  value: string;
  type?: "text" | "email";
  help: string;
}) {
  const [state, action, pending] = useActionState(updateSiteSetting, {} as FormActionState);
  return (
    <form action={action} className="admin-setting-form">
      <input name="key" type="hidden" value={settingKey} />
      <label className="admin-field">
        {label}
        <input defaultValue={value} maxLength={1000} name="value" required type={type} />
        <small>{help}</small>
      </label>
      {state.error && <p className="form-message form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-message form-success" role="status">{state.message}</p>}
      <button className="admin-button" disabled={pending} type="submit">{pending ? "Saving..." : "Save"}</button>
    </form>
  );
}
