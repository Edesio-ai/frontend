import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${process.env.BACKEND_URL}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Cookie": request.headers.get("Cookie") ?? "",
      "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message || "An error occurred while updating the profile" }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}