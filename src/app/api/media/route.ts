import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteStorageObject, getStorageBucket, uploadStorageObject } from "@/lib/storage";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["application/pdf", ".pdf"],
]);
const maximumSize = 10 * 1024 * 1024;
const documentTypeSchema = z.enum([
  "REPORT",
  "CERTIFICATE",
  "PUBLICATION",
  "PROJECT_ATTACHMENT",
  "OTHER",
]);

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function safeFileName(fileName: string, extension: string) {
  const base = fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "file"}${extension}`;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin was not accepted." }, { status: 403 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > maximumSize) {
    return NextResponse.json(
      { error: "Choose a file smaller than 10 MB." },
      { status: 400 },
    );
  }
  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and PDF files are accepted." },
      { status: 415 },
    );
  }

  const kind = formData.get("kind");
  const visibility = formData.get("visibility");
  if (kind === "image" && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choose an image for this upload type." }, { status: 415 });
  }
  if ((kind === "cv" || kind === "document") && file.type !== "application/pdf") {
    return NextResponse.json({ error: "CV and document uploads must be PDF files." }, { status: 415 });
  }
  if (!["image", "document", "cv"].includes(String(kind))) {
    return NextResponse.json({ error: "Choose a valid upload type." }, { status: 400 });
  }

  const isPublicDocument = formData.get("isPublic") === "true";
  const isPrivate =
    kind === "document" ? !isPublicDocument : visibility === "private";
  if (kind === "cv" && isPrivate) {
    return NextResponse.json({ error: "The current CV must be uploaded as a public file." }, { status: 400 });
  }
  let documentType: z.infer<typeof documentTypeSchema> | undefined;
  if (kind === "document") {
    const parsedDocumentType = documentTypeSchema.safeParse(formData.get("documentType"));
    if (!parsedDocumentType.success) {
      return NextResponse.json({ error: "Choose a valid document type." }, { status: 400 });
    }
    documentType = parsedDocumentType.data;
  }

  const bucket = getStorageBucket(isPrivate);
  const safeName = safeFileName(file.name, extension);
  const storageKey = `${session.user.id}/${randomUUID()}-${safeName}`;
  let uploaded = false;
  try {
    const fileBuffer = await file.arrayBuffer();
    const signature = new Uint8Array(fileBuffer.slice(0, 12));
    const validSignature =
      (file.type === "image/jpeg" && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff) ||
      (file.type === "image/png" && signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4e && signature[3] === 0x47) ||
      (file.type === "image/webp" &&
        signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46 &&
        signature[8] === 0x57 && signature[9] === 0x45 && signature[10] === 0x42 && signature[11] === 0x50) ||
      (file.type === "application/pdf" &&
        String.fromCharCode(...signature.slice(0, 5)) === "%PDF-");
    if (!validSignature) {
      return NextResponse.json({ error: "The file contents do not match the selected file type." }, { status: 415 });
    }

    await uploadStorageObject(bucket, storageKey, fileBuffer, file.type);
    uploaded = true;
    const altText = String(formData.get("altText") ?? "").trim().slice(0, 500);
    const caption = String(formData.get("caption") ?? "").trim().slice(0, 1000);
    const title = String(formData.get("title") ?? file.name).trim().slice(0, 200);
    const description = String(formData.get("description") ?? "").trim().slice(0, 2000);
    const cvLabel = String(formData.get("cvLabel") ?? "CV").trim().slice(0, 120);
    const media = await prisma.$transaction(async (transaction) => {
      const created = await transaction.media.create({
        data: {
          storageKey,
          bucket,
          originalName: file.name.slice(0, 255),
          safeName,
          mimeType: file.type,
          sizeBytes: file.size,
          altText,
          caption,
          isPrivate,
          uploadedById: session.user.id,
        },
      });

      if (kind === "cv") {
        await transaction.cvVersion.updateMany({ data: { isCurrent: false } });
        await transaction.cvVersion.create({
          data: { label: cvLabel || "CV", mediaId: created.id, isCurrent: true },
        });
      } else if (kind === "document") {
        if (!documentType) throw new Error("The document type was not validated.");
        await transaction.document.create({
          data: {
            title: title || file.name,
            type: documentType,
            description,
            isPublic: isPublicDocument,
            mediaId: created.id,
          },
        });
      }

      await transaction.auditLog.create({
        data: {
          userId: session.user.id,
          action: "upload",
          entityType: String(kind),
          entityId: created.id,
        },
      });
      return created;
    });

    return NextResponse.json({ id: media.id, message: "File uploaded." }, { status: 201 });
  } catch (error) {
    if (uploaded) {
      try {
        await deleteStorageObject(bucket, storageKey);
      } catch (cleanupError) {
        console.error("Could not clean up an incomplete media upload", cleanupError);
        throw new AggregateError(
          [error, cleanupError],
          "The upload failed and its temporary storage object could not be removed.",
        );
      }
    }
    throw error;
  }
}
