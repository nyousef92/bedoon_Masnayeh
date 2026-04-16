import { adminDb } from "@/lib/firebase-admin";
import { ok, fail } from "@/lib/api-helpers";

const OFFER_TYPES = [
  { id: "ring",      name: "Ring",      nameAr: "خاتم",       order: 1 },
  { id: "necklace",  name: "Necklace",  nameAr: "قلادة",      order: 2 },
  { id: "bracelet",  name: "Bracelet",  nameAr: "سوار",       order: 3 },
  { id: "full-set",  name: "Full Set",  nameAr: "طقم كامل",   order: 4 },
  { id: "earrings",  name: "Earrings",  nameAr: "حلق",        order: 5 },
  { id: "pendant",   name: "Pendant",   nameAr: "دلاية",      order: 6 },
  { id: "anklet",    name: "Anklet",    nameAr: "خلخال",      order: 7 },
  { id: "brooch",    name: "Brooch",    nameAr: "بروش",       order: 8 },
];

// GET /api/seed — seeds the offer_types collection (run once)
export async function GET() {
  try {
    const batch = adminDb.batch();

    for (const type of OFFER_TYPES) {
      const ref = adminDb.collection("offer_types").doc(type.id);
      batch.set(ref, {
        name: type.name,
        nameAr: type.nameAr,
        order: type.order,
        createdAt: new Date().toISOString(),
      });
    }

    await batch.commit();
    return ok({ seeded: OFFER_TYPES.map((t) => t.id) });
  } catch (error) {
    console.error(error);
    return fail("Seed failed", 500);
  }
}
