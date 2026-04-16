import { adminDb } from "@/lib/firebase-admin";
import { ok, fail, preflight } from "@/lib/api-helpers";

export async function OPTIONS() {
  return preflight();
}

// GET /api/offer-types — returns all offer types
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("offer_types")
      .orderBy("order")
      .get();

    const types = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return ok(types);
  } catch (error) {
    console.error(error);
    return fail("Failed to fetch offer types", 500);
  }
}
