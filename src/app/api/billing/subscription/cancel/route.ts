import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${process.env.BACKEND_URL}/billing/subscription/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") || "",
      "x-csrf-token": request.headers.get("x-csrf-token") || "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message }, { status: response.status });
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data);
}
