import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";

export function hashValue(value: string) {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "local-development"}:${value}`)
    .digest("hex");
}

export function newOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export async function requestIpHash() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip =
    requestHeaders.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "unknown";
  return hashValue(ip);
}
