"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadDocumentForm() {
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
      setMessage(result.message ?? "Document uploaded.");
      form.reset();
      router.refresh();
    } catch (reason) {
      setError(true);
      setMessage(reason instanceof Error ? reason.message : "The document could not be uploaded.");
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
      <input name="kind" type="hidden" value="document" />
      <label>
        PDF file
        <input accept="application/pdf,.pdf" name="file" required type="file" />
      </label>
      <label>
        Document title
        <input maxLength={200} name="title" required />
      </label>
      <label>
        Document type
        <select defaultValue="OTHER" name="documentType">
          <option value="REPORT">Report</option>
          <option value="CERTIFICATE">Certificate</option>
          <option value="PUBLICATION">Publication</option>
          <option value="PROJECT_ATTACHMENT">Project attachment</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label>
        <span>Access</span>
        <select defaultValue="false" name="isPublic">
          <option value="false">Private</option>
          <option value="true">Public download</option>
        </select>
      </label>
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Uploading..." : "Upload PDF"}
      </button>
      {message && <p className={`form-message ${error ? "form-error" : "form-success"}`} role={error ? "alert" : "status"}>{message}</p>}
    </form>
  );
}

export function UploadCvForm() {
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
      if (!response.ok) throw new Error(result.error ?? "CV upload failed.");
      setMessage("CV uploaded and marked as the current public version.");
      form.reset();
      router.refresh();
    } catch (reason) {
      setError(true);
      setMessage(reason instanceof Error ? reason.message : "The CV could not be uploaded.");
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
      <input name="kind" type="hidden" value="cv" />
      <input name="visibility" type="hidden" value="public" />
      <label>
        CV PDF
        <input accept="application/pdf,.pdf" name="file" required type="file" />
      </label>
      <label>
        Version label
        <input defaultValue="CV" maxLength={120} name="cvLabel" required />
      </label>
      <button className="admin-button admin-button-primary" disabled={pending} type="submit">
        {pending ? "Uploading..." : "Upload and publish CV"}
      </button>
      {message && <p className={`form-message ${error ? "form-error" : "form-success"}`} role={error ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
