"use client";

import { updateEnquiryStatus } from "@/app/admin/actions";

export function EnquiryStatusForm({
  id,
  targetStatus,
}: {
  id: string;
  targetStatus: "NEW" | "READ" | "ARCHIVED";
}) {
  return (
    <form action={updateEnquiryStatus}>
      <input name="id" type="hidden" value={id} />
      <input name="status" type="hidden" value={targetStatus} />
      <button className="admin-button" type="submit">
        {targetStatus === "READ"
          ? "Mark as read"
          : targetStatus === "ARCHIVED"
            ? "Archive"
            : "Restore"}
      </button>
    </form>
  );
}
