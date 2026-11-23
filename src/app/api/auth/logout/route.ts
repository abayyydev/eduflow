import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  await destroySession();
  const url = new URL("/login", request.url);
  // Status 303 (See Other) ensures the browser changes the POST request to a GET /login
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: NextRequest) {
  await destroySession();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
