import "server-only";

import { Resend } from "resend";

type EmailRequest = {
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail({ to, subject, text }: EmailRequest) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return { sent: false as const, reason: "Email delivery is not configured." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    text,
  });
  if (result.error) {
    console.error("Transactional email delivery failed", result.error);
    return { sent: false as const, reason: "The email provider rejected the message." };
  }
  return { sent: true as const };
}
