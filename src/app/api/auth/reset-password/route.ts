import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.BACKEND_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An issue occurred during reset password; please contact customer support.",
        code: error.code || "UNKNOWN_ERROR",
      },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}
