import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { fileId } = await context.params;

  const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course-file/${fileId}/signed-url`, {
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
