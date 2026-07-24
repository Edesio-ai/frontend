import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course`, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "Content-Type": "application/json",
      "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
