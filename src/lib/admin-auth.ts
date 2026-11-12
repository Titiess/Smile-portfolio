import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  return session.user;
}

export async function requireAdministrator() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}
