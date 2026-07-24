import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.BACKEND_URL}/auth/update-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: req.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.message || "An error occured while updating the password" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}
