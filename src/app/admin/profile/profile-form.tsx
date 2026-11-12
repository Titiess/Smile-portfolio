"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/admin/actions";
import type { FormActionState } from "@/app/admin/actions";

export function ProfileForm({
  values,
}: {
  values: {
    name: string;
    title: string;
    email: string;
    linkedinUrl: string;
    biography: string;
  };
}) {
  const [state, action, pending] = useActionState(updateProfile, {} as FormActionState);
  return (
    <form action={action} className="admin-card admin-profile-form">
      <div className="admin-card-heading">
        <h2>Public profile</h2>
        <span>Changes appear on the portfolio</span>
      </div>
      <div className="admin-card-body admin-editor-grid">
        <label className="admin-field">
          Name
          <input defaultValue={values.name} maxLength={120} name="name" required />
        </label>
        <label className="admin-field">
          Professional title
          <input defaultValue={values.title} maxLength={180} name="title" required />
        </label>
        <label className="admin-field">
          Contact email
          <input defaultValue={values.email} maxLength={254} name="email" required type="email" />
        </label>
        <label className="admin-field">
          LinkedIn URL
          <input defaultValue={values.linkedinUrl} maxLength={500} name="linkedinUrl" type="url" />
        </label>
        <label className="admin-field admin-field-wide">
          Biography
          <textarea defaultValue={values.biography} maxLength={10000} name="biography" rows={8} />
        </label>
        {state.error && <p className="form-message form-error admin-field-wide" role="alert">{state.error}</p>}
        {state.message && <p className="form-message form-success admin-field-wide" role="status">{state.message}</p>}
        <div className="admin-field-wide">
          <button className="admin-button admin-button-primary" disabled={pending} type="submit">
            {pending ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
