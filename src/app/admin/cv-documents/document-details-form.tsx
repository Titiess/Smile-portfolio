"use client";

import { useActionState } from "react";
import { updateDocument, deleteDocument } from "@/app/admin/actions";
import type { FormActionState } from "@/app/admin/actions";

export function DocumentDetailsForm({
  id,
  title,
  type,
  description,
  isPublic,
}: {
  id: string;
  title: string;
  type: string;
  description: string;
  isPublic: boolean;
}) {
  const [state, action, pending] = useActionState(updateDocument, {} as FormActionState);
  return (
    <>
      <form action={action} className="admin-document-form">
        <input name="id" type="hidden" value={id} />
        <label>
          Title
          <input defaultValue={title} maxLength={200} name="title" required />
        </label>
        <label>
          Type
          <select defaultValue={type} name="type">
            <option value="REPORT">Report</option>
            <option value="CERTIFICATE">Certificate</option>
            <option value="PUBLICATION">Publication</option>
            <option value="PROJECT_ATTACHMENT">Project attachment</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>
          Description
          <input defaultValue={description} maxLength={2000} name="description" />
        </label>
        <p className="admin-document-access">
          Access: <strong>{isPublic ? "Public" : "Private"}</strong>
          <small>To change access, remove and upload the file again with the desired visibility.</small>
        </p>
        {state.error && <small className="field-error" role="alert">{state.error}</small>}
        {state.message && <small className="field-success" role="status">{state.message}</small>}
        <button className="admin-button" disabled={pending} type="submit">{pending ? "Saving..." : "Save details"}</button>
      </form>
      <form
        action={deleteDocument}
        className="admin-document-delete-form"
        onSubmit={(event) => {
          if (!window.confirm("Remove this document from the library?")) event.preventDefault();
        }}
      >
        <input name="id" type="hidden" value={id} />
        <button className="admin-button admin-button-danger" type="submit">Remove document</button>
      </form>
    </>
  );
}
