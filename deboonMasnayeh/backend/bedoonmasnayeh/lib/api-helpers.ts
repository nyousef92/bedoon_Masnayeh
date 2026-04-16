import { NextResponse } from "next/server";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function ok(data: object, extra?: object) {
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

export function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      data: null,
      success: false,
      responseCode: status,
      detailMessage: message,
      messages: message,
      hasMessage: true,
    },
    { status, headers: CORS_HEADERS }
  );
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
