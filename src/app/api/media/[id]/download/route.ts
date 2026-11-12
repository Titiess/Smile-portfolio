import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPrivateStorageUrl, getPublicStorageUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (id.length > 64) return NextResponse.json({ error: "File not found." }, { status: 404 });

  const media = await prisma.media.findUnique({
    where: { id },
    include: { documents: { select: { isPublic: true } } },
  });
  if (!media) return NextResponse.json({ error: "File not found." }, { status: 404 });
  const session = await auth();
  if (
    (media.isPrivate || media.documents.some((document) => !document.isPublic)) &&
    !session?.user?.id
  ) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = media.isPrivate
    ? await getPrivateStorageUrl(media.bucket, media.storageKey)
    : await getPublicStorageUrl(media.bucket, media.storageKey);
  return NextResponse.redirect(url);
}
