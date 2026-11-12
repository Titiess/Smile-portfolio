"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(form: HTMLFormElement) {
    setPending(true);
    setError(false);
    setMessage("");
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Upload failed.");
      setMessage(result.message ?? "File uploaded.");
      form.reset();
      router.refresh();
    } catch (reason) {
      setError(true);
      setMessage(reason instanceof Error ? reason.message : "The file could not be uploaded.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="admin-upload-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(event.currentTarget);
      }}
    >
      <input name="kind" type="hidden" value="image" />
      <label>
        Choose image
        <input accept="image/jpeg,image/png,image/webp" name="file" required type="file" />
      </label>
      <label>
        Alt text
        <input maxLength={500} name="altText" placeholder="Describe the image for accessibility" />
      </label>
      <label>
        Visibility
        <select defaultValue="public" name="visibility">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </label>
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Uploading..." : "Upload image"}
      </button>
      {message && <p className={`form-message ${error ? "form-error" : "form-success"}`} role={error ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
