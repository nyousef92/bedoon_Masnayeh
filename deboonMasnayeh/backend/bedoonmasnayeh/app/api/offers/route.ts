import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { ok, fail, preflight } from "@/lib/api-helpers";

export async function OPTIONS() {
  return preflight();
}

// GET /api/offers?pageNumber=1&pageSize=10 — list active offers with pagination
// GET /api/offers?userId=xxx — list all offers by a specific user (all statuses, no pagination)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // My-offers mode: return paginated offers for the given user, sorted by createdAt desc
    if (userId) {
      const pageNumber = Math.max(1, parseInt(searchParams.get("pageNumber") ?? "1"));
      const pageSize   = Math.min(20, Math.max(1, parseInt(searchParams.get("pageSize") ?? "12")));

      const totalSnapshot = await adminDb
        .collection("offers")
        .where("userId", "==", userId)
        .count()
        .get();
      const total = totalSnapshot.data().count;

      let query = adminDb
        .collection("offers")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(pageSize);

      if (pageNumber > 1) {
        const offset = (pageNumber - 1) * pageSize;
        const cursorSnapshot = await adminDb
          .collection("offers")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(offset)
          .get();
        const lastDoc = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return ok({ items, total, pageNumber, pageSize, totalPages: Math.ceil(total / pageSize) });
    }

    const pageNumber = Math.max(1, parseInt(searchParams.get("pageNumber") ?? "1"));
    const pageSize   = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10")));

    // Get total count of active offers
    const totalSnapshot = await adminDb
      .collection("offers")
      .where("status", "==", "active")
      .count()
      .get();
    const total = totalSnapshot.data().count;

    // Fetch the page
    // Firestore doesn't support offset natively for large datasets,
    // so we use startAfter with a cursor for efficiency
    let query = adminDb
      .collection("offers")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(pageSize);

    if (pageNumber > 1) {
      const offset = (pageNumber - 1) * pageSize;
      const cursorSnapshot = await adminDb
        .collection("offers")
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(offset)
        .get();

      const lastDoc = cursorSnapshot.docs[cursorSnapshot.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return ok({
      items,
      total,
      pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/offers]", message);
    return fail(`Failed to fetch offers: ${message}`, 500);
  }
}

// POST /api/offers — create a new offer
// Body: { title, description, offerTypeId, karat, weight, manufacturingWagePerGram, condition, images, userId, cityId, phone }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      offerTypeId,
      karat,
      weight,
      manufacturingWagePerGram,
      condition,
      images,
      userId,
      cityId,
      phone,
    } = body;

    // Validate required fields
    if (!title) return fail("title is required");
    if (!offerTypeId) return fail("offerTypeId is required");
    if (!karat || ![18, 21, 24].includes(karat)) return fail("karat must be 18, 21, or 24");
    if (!weight || weight <= 0) return fail("weight must be a positive number");
    if (manufacturingWagePerGram === undefined || manufacturingWagePerGram < 0)
      return fail("manufacturingWagePerGram is required and must be >= 0");
    if (!userId) return fail("userId is required");
    if (!cityId || typeof cityId !== "number") return fail("cityId is required and must be a number");
    if (!phone || !/^\+9627[0-9]{8}$/.test(phone)) return fail("phone must be a valid Jordanian mobile number (+9627XXXXXXXX)");

    const offer = {
      title,
      description: description ?? "",
      offerTypeId,
      karat,
      weight,
      manufacturingWagePerGram,
      condition: condition ?? "new",
      images: images ?? [],
      status: "active",
      userId,
      cityId,
      phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ref = await adminDb.collection("offers").add(offer);
    return ok({ id: ref.id, ...offer });
  } catch (error) {
    console.error(error);
    return fail("Failed to create offer", 500);
  }
}
