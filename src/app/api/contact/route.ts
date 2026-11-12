import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashValue } from "@/lib/security";
import { sendTransactionalEmail } from "@/lib/email";

export const runtime = "nodejs";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The enquiry could not be read." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check that every field is complete and uses a valid email address." },
      { status: 400 },
    );
  }
  if (parsed.data.website) {
    return NextResponse.json({ message: "Thank you. Your message has been received." });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "unknown";
  const limitKey = hashValue(`${ip}:${parsed.data.email.toLowerCase()}`);
  const limits = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
    INSERT INTO "ContactRateLimit" ("key", "windowStart", "count", "updatedAt")
    VALUES (${limitKey}, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "ContactRateLimit"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1
        ELSE "ContactRateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "ContactRateLimit"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN CURRENT_TIMESTAMP
        ELSE "ContactRateLimit"."windowStart"
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "windowStart"
  `;
  if (!limits[0] || limits[0].count > 5) {
    return NextResponse.json(
      { error: "Too many messages were submitted. Please try again later." },
      { status: 429 },
    );
  }

  const enquiry = await prisma.contactEnquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      subject: parsed.data.subject,
      message: parsed.data.message,
      ipHash: hashValue(ip),
    },
  });

  const profile = await prisma.profile.findUnique({
    where: { id: "primary" },
    select: { email: true },
  });
  const delivery = await sendTransactionalEmail({
    to: profile?.email ?? "smileniko18@gmail.com",
    subject: `Portfolio enquiry: ${parsed.data.subject}`,
    text: [
      `From: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Subject: ${parsed.data.subject}`,
      "",
      parsed.data.message,
      "",
      `Enquiry reference: ${enquiry.id}`,
    ].join("\n"),
  });

  if (delivery.sent) {
    await prisma.contactEnquiry.update({
      where: { id: enquiry.id },
      data: { emailSentAt: new Date(), notificationError: null },
    });
    await prisma.auditLog.create({
      data: {
        action: "contact-notification-sent",
        entityType: "contact-enquiry",
        entityId: enquiry.id,
        ipHash: hashValue(ip),
      },
    });
    return NextResponse.json({ message: "Thank you. Your message has been received." });
  }

  await prisma.contactEnquiry.update({
    where: { id: enquiry.id },
    data: { notificationError: delivery.reason ?? "Email notification is unavailable." },
  });
  console.error("Contact enquiry saved, but notification was not delivered", {
    enquiryId: enquiry.id,
    reason: delivery.reason,
  });
  return NextResponse.json({
    message:
      "Your message was saved, but email notification is unavailable right now. For urgent matters, please email directly.",
    notificationWarning: true,
  });
}
