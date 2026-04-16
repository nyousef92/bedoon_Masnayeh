import { NextResponse } from "next/server";
import { addItem, getAll } from "@/lib/db";

// GET /api/test  →  reads everything from the "test" collection
export async function GET() {
  try {
    const items = await getAll("test");
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/test  →  writes a document to the "test" collection
export async function POST() {
  try {
    const id = await addItem("test", {
      message: "Firebase is connected!",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
