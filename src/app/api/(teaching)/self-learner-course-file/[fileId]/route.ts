import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { fileId } = await context.params;

  const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course-file/${fileId}`, {
    method: "DELETE",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
