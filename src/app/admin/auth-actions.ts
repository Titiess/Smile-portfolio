"use server";

import { timingSafeEqual } from "node:crypto";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { FormActionState } from "@/app/admin/actions";

export async function loginAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = z
    .object({
      email: z.string().email().max(254),
      password: z.string().min(1).max(128),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!parsed.success) return { error: "Enter a valid email address and password." };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Sign-in failed. Check your credentials or try again later." };
    }
    throw error;
  }

  return {};
}

function matchesSetupToken(candidate: string, expected: string) {
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function setupAdminAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email().max(254),
      password: z.string().min(14).max(128),
      setupToken: z.string().min(1).max(500),
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      setupToken: formData.get("setupToken"),
    });
  if (!parsed.success) {
    return {
      error: "Provide a name, valid email, password of at least 14 characters, and setup token.",
    };
  }

  const expectedToken = process.env.ADMIN_SETUP_TOKEN;
  if (!expectedToken || !matchesSetupToken(parsed.data.setupToken, expectedToken)) {
    return { error: "The setup token is invalid or has not been configured." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  try {
    await prisma.$transaction(
      async (transaction) => {
        const existingUsers = await transaction.user.count();
        if (existingUsers > 0) throw new Error("ADMIN_ALREADY_CONFIGURED");
        await transaction.user.create({
          data: {
            name: parsed.data.name,
            email: parsed.data.email.toLowerCase(),
            passwordHash,
            role: "ADMIN",
          },
        });
        await transaction.profile.upsert({
          where: { id: "primary" },
          create: {
            id: "primary",
            name: "Smile Nikoro",
            title: "Environmental Engineer & HSE Professional",
            email: "smileniko18@gmail.com",
            linkedinUrl: "https://www.linkedin.com/in/smile-nikoro-a660553b3/",
          },
          update: {},
        });
        const [experienceCount, educationCount, certificationCount] =
          await Promise.all([
            transaction.experience.count(),
            transaction.education.count(),
            transaction.certification.count(),
          ]);
        if (experienceCount === 0) {
          await transaction.experience.createMany({
            data: [
              {
                organisation: "Transmission Company of Nigeria",
                jobTitle: "HSE Department",
                location: "Ughelli, Delta State",
                description: "Industrial experience in the HSE Department.",
              },
              {
                organisation: "Owerri Municipal Council",
                jobTitle: "National Youth Service Corps (NYSC)",
                location: "Owerri, Imo State",
                description: "NYSC service in the Office of the Chairman.",
                displayOrder: 1,
              },
            ],
          });
        }
        if (educationCount === 0) {
          await transaction.education.create({
            data: {
              institution: "Petroleum Training Institute",
              qualification: "Higher National Diploma (HND)",
              programme: "Environmental Engineering",
            },
          });
        }
        if (certificationCount === 0) {
          await transaction.certification.create({
            data: { name: "ISPON HSE Level 3", issuingBody: "ISPON" },
          });
        }
        await transaction.siteSettings.createMany({
          data: [
            {
              key: "site-title",
              value: "Smile Nikoro | Environmental Engineering and HSE Portfolio",
            },
            {
              key: "site-description",
              value: "Environmental Engineering, HSE and sustainability portfolio of Smile Nikoro.",
            },
            { key: "contact-email", value: "smileniko18@gmail.com" },
          ],
          skipDuplicates: true,
        });
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_ALREADY_CONFIGURED") {
      return { error: "An administrator already exists. Use the sign-in page." };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "An account already uses that email address." };
    }
    throw error;
  }

  return { message: "Administrator created. You can now sign in." };
}

export async function requestPasswordResetAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = z.string().email().max(254).safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!process.env.RESEND_API_KEY || !process.env.NEXT_PUBLIC_SITE_URL) {
    return { error: "Password reset email is not configured. Contact the site administrator." };
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.toLowerCase() },
    select: { id: true, email: true, disabledAt: true },
  });
  if (!user || user.disabledAt) {
    return { message: "If an active account exists for that address, a reset link will be sent." };
  }

  const recentRequest = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
    select: { id: true },
  });
  if (recentRequest) {
    return { message: "If an active account exists for that address, a reset link will be sent." };
  }

  const { newOpaqueToken, hashValue } = await import("@/lib/security");
  const opaqueToken = newOpaqueToken();
  const reset = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashValue(opaqueToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const { sendTransactionalEmail } = await import("@/lib/email");
  const resetUrl = new URL("/admin/reset-password", process.env.NEXT_PUBLIC_SITE_URL);
  resetUrl.searchParams.set("token", opaqueToken);
  const result = await sendTransactionalEmail({
    to: user.email,
    subject: "Reset your Smile Nikoro portfolio password",
    text: `Use this one-time link within 60 minutes to reset your administrator password:\n\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
  });
  if (!result.sent) {
    await prisma.passwordResetToken.delete({ where: { id: reset.id } });
    throw new Error("The password reset email could not be sent. Check the email provider configuration.");
  }

  return { message: "If an active account exists for that address, a reset link will be sent." };
}

export async function resetPasswordAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = z
    .object({
      token: z.string().min(20).max(200),
      password: z.string().min(14).max(128),
    })
    .safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
    });
  if (!parsed.success) return { error: "Enter a new password of at least 14 characters." };
  const { hashValue } = await import("@/lib/security");
  const reset = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashValue(parsed.data.token) },
  });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
    return { error: "This password-reset link is invalid or has expired." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash, authVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: reset.userId, id: { not: reset.id } },
    }),
  ]);
  return { message: "Password updated. You can now sign in." };
}
