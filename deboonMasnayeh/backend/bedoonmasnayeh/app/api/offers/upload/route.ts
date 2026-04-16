import { NextRequest } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";
import { ok, fail, preflight } from "@/lib/api-helpers";

export async function OPTIONS() {
  return preflight();
}

// POST /api/offers/upload — upload an offer image to Firebase Storage
// Body: multipart/form-data with a `file` field
export async function POST(req: NextRequest) {
  try {
    console.log("[upload] FIREBASE_STORAGE_BUCKET =", process.env.FIREBASE_STORAGE_BUCKET);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return fail("file is required");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return fail("Only JPEG, PNG, and WebP images are allowed");
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      return fail("File size must not exceed 5 MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `offers/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: { cacheControl: "public, max-age=31536000" },
    });

    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    return ok({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/offers/upload]", message);
    return fail(`Failed to upload image: ${message}`, 500);
  }
}
