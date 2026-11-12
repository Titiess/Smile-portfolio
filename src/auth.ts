import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashValue } from "@/lib/security";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

const dummyPasswordHash =
  "$2b$12$HzCzI4/xxMhQnmC1AJtaz.flh9scRd/O6.0k2kmdBD3xec2SVPhi2";

const fifteenMinutes = 15 * 60 * 1000;
const maxAttempts = 5;

async function checkLoginLimit(key: string) {
  const now = new Date();
  const attempt = await prisma.loginAttempt.findUnique({ where: { key } });
  if (!attempt) return true;
  if (attempt.lockedUntil && attempt.lockedUntil > now) return false;
  if (now.getTime() - attempt.windowStart.getTime() >= fifteenMinutes) {
    return true;
  }
  return attempt.failures < maxAttempts;
}

async function recordLoginFailure(key: string) {
  const now = new Date();
  const previous = await prisma.loginAttempt.findUnique({ where: { key } });
  if (!previous || now.getTime() - previous.windowStart.getTime() >= fifteenMinutes) {
    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, failures: 1, windowStart: now },
      update: { failures: 1, windowStart: now, lockedUntil: null },
    });
    return;
  }

  const failures = previous.failures + 1;
  await prisma.loginAttempt.update({
    where: { key },
    data: {
      failures,
      lockedUntil: failures >= maxAttempts ? new Date(now.getTime() + fifteenMinutes) : null,
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const ip =
          request.headers.get("x-real-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        const attemptKey = hashValue(`${email}:${ip}`);
        if (!(await checkLoginLimit(attemptKey))) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const passwordMatches = await compare(
          parsed.data.password,
          user?.passwordHash ?? dummyPasswordHash,
        );
        if (!user || user.disabledAt || !passwordMatches) {
          await recordLoginFailure(attemptKey);
          return null;
        }

        await prisma.loginAttempt.deleteMany({ where: { key: attemptKey } });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          authVersion: user.authVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.authVersion = user.authVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.sub) {
        session.user.id = "";
        session.user.role = "EDITOR";
        return session;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { id: true, name: true, email: true, role: true, authVersion: true, disabledAt: true },
      });
      if (
        !currentUser ||
        currentUser.disabledAt ||
        token.authVersion !== currentUser.authVersion
      ) {
        session.user.id = "";
        session.user.role = "EDITOR";
        session.user.authVersion = -1;
        return session;
      }

      session.user.id = currentUser.id;
      session.user.name = currentUser.name;
      session.user.email = currentUser.email;
      session.user.role = currentUser.role;
      session.user.authVersion = currentUser.authVersion;
      return session;
    },
  },
});
