import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { ok, fail, preflight } from "@/lib/api-helpers";

export async function OPTIONS() {
  return preflight();
}

// GET /api/offers/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("offers").doc(id).get();
    if (!doc.exists) return fail("Offer not found", 404);
    return ok({ id: doc.id, ...doc.data()! });
  } catch (error) {
    console.error(error);
    return fail("Failed to fetch offer", 500);
  }
}

function removeUndefined(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

// PUT /api/offers/[id] — update an offer
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const docRef = adminDb.collection("offers").doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return fail("Offer not found", 404);

    const current = existing.data()!;

    const updated = removeUndefined({
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    });

    await docRef.set(updated);
    return ok({ id, ...updated });
  } catch (error) {
    console.error(error);
    return fail(String(error), 500);
  }
}

// DELETE /api/offers/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("offers").doc(id).get();
    if (!doc.exists) return fail("Offer not found", 404);
    await adminDb.collection("offers").doc(id).delete();
    return ok({ id, deleted: true });
  } catch (error) {
    console.error(error);
    return fail("Failed to delete offer", 500);
  }
}
