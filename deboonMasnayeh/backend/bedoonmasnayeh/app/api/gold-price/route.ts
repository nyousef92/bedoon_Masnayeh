import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { ok, fail, preflight } from "@/lib/api-helpers";

const DOC = () => adminDb.collection("settings").doc("gold_price");

export async function OPTIONS() {
  return preflight();
}

// GET /api/gold-price — returns current gold price per gram per karat
export async function GET() {
  try {
    const doc = await DOC().get();
    if (!doc.exists) {
      return fail("Gold price not set yet", 404);
    }
    return ok(doc.data()!);
  } catch (error) {
    console.error(error);
    return fail("Failed to fetch gold price", 500);
  }
}

// PUT /api/gold-price — admin updates the gold price per gram for each karat
// Body: { prices: { "18": number, "21": number, "22": number, "24": number } }
export async function PUT(req: NextRequest) {
  try {
    const { prices } = await req.json();

    if (!prices || typeof prices !== "object") {
      return fail("prices must be an object with keys 18, 21, 22, 24");
    }

    const karats = [18, 21, 24];
    for (const k of karats) {
      const val = prices[k];
      if (typeof val !== "number" || val <= 0) {
        return fail(`prices.${k} must be a positive number`);
      }
    }

    const data = {
      prices: {
        18: prices[18],
        21: prices[21],
        24: prices[24],
      },
      updatedAt: new Date().toISOString(),
    };

    await DOC().set(data);
    return ok(data);
  } catch (error) {
    console.error(error);
    return fail("Failed to update gold price", 500);
  }
}
