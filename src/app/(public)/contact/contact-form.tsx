"use client";

import { useState } from "react";

type ContactFormProps = { email: string };

export function ContactForm({ email }: ContactFormProps) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    setIsError(false);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        message?: string;
        error?: string;
        notificationWarning?: boolean;
      };
      setMessage(result.message ?? result.error ?? "The message could not be sent.");
      setIsError(!response.ok || Boolean(result.notificationWarning));
      if (response.ok && !result.notificationWarning) {
        document.querySelector<HTMLFormElement>("#contact-form")?.reset();
      }
    } catch {
      setMessage(`The message could not be sent. Please email ${email} directly.`);
      setIsError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="contact-form"
      id="contact-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <div className="contact-form-row">
        <label>
          Your name
          <input autoComplete="name" maxLength={120} minLength={2} name="name" placeholder="Smile Nikoro" required />
        </label>
        <label>
          Email address
          <input autoComplete="email" maxLength={254} name="email" placeholder="example@email.com" required type="email" />
        </label>
      </div>
      <label>
        Subject
        <input maxLength={160} minLength={3} name="subject" placeholder="Environmental consultation enquiry" required />
      </label>
      <label>
        Message
        <textarea maxLength={5000} minLength={10} name="message" placeholder="Please write your message here..." required rows={6} />
      </label>
      <div aria-hidden="true" className="contact-honeypot">
        <label htmlFor="website-field">Leave this field empty</label>
        <input autoComplete="off" id="website-field" name="website" tabIndex={-1} />
      </div>
      {message && (
        <p className={`form-message ${isError ? "form-error" : "form-success"}`} role={isError ? "alert" : "status"}>
          {message}
        </p>
      )}
      <button className="button" disabled={pending} type="submit">
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
