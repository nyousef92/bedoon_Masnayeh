import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Wraps any data in the ApiResponse format Angular expects
function apiResponse(data: object, extra?: object) {
  return NextResponse.json(
    {
      data,
      success: true,
      responseCode: 200,
      id: "",
      loginUser: null,
      detailMessage: null,
      messages: [],
      hasMessage: false,
      total: 0,
      ...extra,
    },
    { headers: CORS_HEADERS }
  );
}

function apiError(message: string, status = 400) {
  return NextResponse.json(
    {
      data: null,
      success: false,
      responseCode: status,
      id: "",
      loginUser: null,
      detailMessage: message,
      messages: message,
      hasMessage: true,
      total: 0,
    },
    { status, headers: CORS_HEADERS }
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  return /^\+?\d{7,15}$/.test(value.replace(/\s/g, ""));
}

function toE164(phone: string): string {
  const digits = phone.replace(/\s/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

// Calls Firebase Auth REST API to sign in and get a token
async function firebaseSignIn(email: string, password: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  return res.json() as Promise<{
    idToken?: string;
    refreshToken?: string;
    expiresIn?: string;
    error?: { message: string };
  }>;
}

// ─── OPTIONS — preflight for CORS ────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─── POST /api/auth ───────────────────────────────────────────────────────────
//
// Body: { emailOrPhone: string, password: string }
//
// - If the user exists   → logs them in  → returns token + action: "login"
// - If the user is new   → registers     → returns token + action: "register"

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emailOrPhone, password } = body ?? {};

  if (!emailOrPhone || !password) {
    return apiError("emailOrPhone and password are required");
  }

  try {
    // ── EMAIL FLOW ────────────────────────────────────────────────────────
    if (isEmail(emailOrPhone)) {
      const email = emailOrPhone.toLowerCase().trim();

      const exists = await adminAuth
        .getUserByEmail(email)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        // LOGIN
        const result = await firebaseSignIn(email, password);
        if (result.error) {
          return apiError("Wrong password", 401);
        }
        const userRecord = await adminAuth.getUserByEmail(email);
        return apiResponse({
          tokenType: "Bearer",
          accessToken: result.idToken,
          expiresIn: parseInt(result.expiresIn ?? "3600"),
          refreshToken: result.refreshToken,
          refreshTokenExpiresIn: 604800,
          action: "login",
          user: {
            id: userRecord.uid,
            displayName: userRecord.displayName ?? email,
            email: userRecord.email,
            role: "user",
          },
        });
      } else {
        // REGISTER
        const userRecord = await adminAuth.createUser({ email, password });
        await adminDb.collection("users").doc(userRecord.uid).set({
          email,
          createdAt: new Date().toISOString(),
        });
        const result = await firebaseSignIn(email, password);
        return apiResponse({
          tokenType: "Bearer",
          accessToken: result.idToken,
          expiresIn: parseInt(result.expiresIn ?? "3600"),
          refreshToken: result.refreshToken,
          refreshTokenExpiresIn: 604800,
          action: "register",
          user: {
            id: userRecord.uid,
            displayName: email,
            email,
            role: "user",
          },
        });
      }
    }

    // ── PHONE FLOW ────────────────────────────────────────────────────────
    if (isPhone(emailOrPhone)) {
      const phone = toE164(emailOrPhone);

      const snapshot = await adminDb
        .collection("users")
        .where("phone", "==", phone)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        // LOGIN
        const userData = snapshot.docs[0].data();
        const result = await firebaseSignIn(userData.email, password);
        if (result.error) {
          return apiError("Wrong password", 401);
        }
        return apiResponse({
          tokenType: "Bearer",
          accessToken: result.idToken,
          expiresIn: parseInt(result.expiresIn ?? "3600"),
          refreshToken: result.refreshToken,
          refreshTokenExpiresIn: 604800,
          action: "login",
          user: {
            id: snapshot.docs[0].id,
            displayName: phone,
            phone,
            role: "user",
          },
        });
      } else {
        // REGISTER
        const internalEmail = `${phone.replace("+", "")}@phone.bedoonmasnayeh`;
        const userRecord = await adminAuth.createUser({
          email: internalEmail,
          password,
          phoneNumber: phone,
        });
        await adminDb.collection("users").doc(userRecord.uid).set({
          phone,
          email: internalEmail,
          createdAt: new Date().toISOString(),
        });
        const result = await firebaseSignIn(internalEmail, password);
        return apiResponse({
          tokenType: "Bearer",
          accessToken: result.idToken,
          expiresIn: parseInt(result.expiresIn ?? "3600"),
          refreshToken: result.refreshToken,
          refreshTokenExpiresIn: 604800,
          action: "register",
          user: {
            id: userRecord.uid,
            displayName: phone,
            phone,
            role: "user",
          },
        });
      }
    }

    return apiError("Please provide a valid email or phone number");
  } catch (error) {
    console.error("Auth error:", error);
    return apiError("Something went wrong", 500);
  }
}
