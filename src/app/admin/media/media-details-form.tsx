"use client";

import { useActionState } from "react";
import { updateMediaMetadata } from "@/app/admin/actions";
import type { FormActionState } from "@/app/admin/actions";

export function MediaDetailsForm({
  id,
  altText,
  caption,
}: {
  id: string;
  altText: string;
  caption: string;
}) {
  const [state, action, pending] = useActionState(
    updateMediaMetadata,
    {} as FormActionState,
  );
  return (
    <form action={action} className="admin-media-meta-form">
      <input name="id" type="hidden" value={id} />
      <label>
        Alt text
        <input defaultValue={altText} maxLength={500} name="altText" />
      </label>
      <label>
        Caption
        <input defaultValue={caption} maxLength={1000} name="caption" />
      </label>
      {state.error && <small className="field-error" role="alert">{state.error}</small>}
      {state.message && <small className="field-success" role="status">{state.message}</small>}
      <button className="admin-button" disabled={pending} type="submit">
        {pending ? "Saving..." : "Save details"}
      </button>
    </form>
  );
}
