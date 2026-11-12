"use client";

import { deleteMedia } from "@/app/admin/actions";

export function DeleteMediaForm({ id }: { id: string }) {
  return (
    <form
      action={deleteMedia}
      onSubmit={(event) => {
        if (!window.confirm("Delete this media file permanently?")) event.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={id} />
      <button className="admin-button admin-button-danger" type="submit">Delete file</button>
    </form>
  );
}
