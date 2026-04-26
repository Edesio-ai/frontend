import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ sessionId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { sessionId } = await params;

  const response = await fetch(`${process.env.BACKEND_URL}/question/pending/${sessionId}`, {
    headers: {
      "Cookie": request.headers.get("Cookie") ?? "",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
  }

  const data = await response.json();

  return NextResponse.json({ count: data.count }, { status: 200 });
}