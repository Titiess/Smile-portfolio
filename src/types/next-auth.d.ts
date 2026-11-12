import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      authVersion: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    authVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    authVersion?: number;
  }
}
