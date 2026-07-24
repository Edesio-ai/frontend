import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = await fetch(`${process.env.BACKEND_URL}/self-learner`, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const response = await fetch(`${process.env.BACKEND_URL}/self-learner`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
