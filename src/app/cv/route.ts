import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicStorageUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const currentCv = await prisma.cvVersion.findFirst({
    where: { isCurrent: true, media: { isPrivate: false } },
    include: { media: { select: { bucket: true, storageKey: true } } },
  });
  if (!currentCv) {
    return NextResponse.json(
      { error: "There is no approved public CV available yet." },
      { status: 404 },
    );
  }
  return NextResponse.redirect(
    await getPublicStorageUrl(currentCv.media.bucket, currentCv.media.storageKey),
  );
}
