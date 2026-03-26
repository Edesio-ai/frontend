// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = await fetch(`${process.env.BACKEND_URL}/auth/session`, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  if(!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message || "An error occured while fetching the session" }, { status: response.status });
  }

  const { user, role } = await response.json();

  return NextResponse.json({ user, role });
}