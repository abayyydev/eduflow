import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/server/auth/session";

export async function POST(request: NextRequest) {
  await destroySession();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  await destroySession();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
