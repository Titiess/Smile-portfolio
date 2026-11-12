"use client";

import { deleteContent } from "@/app/admin/actions";
import type { AdminModule } from "@/lib/admin-modules";

export function DeleteContentForm({
  module,
  id,
}: {
  module: AdminModule;
  id: string;
}) {
  return (
    <form
      action={deleteContent}
      onSubmit={(event) => {
        if (!window.confirm("Delete this content permanently? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input name="module" type="hidden" value={module} />
      <input name="id" type="hidden" value={id} />
      <button className="admin-button admin-button-danger" type="submit">Delete</button>
    </form>
  );
}
