import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};
export async function POST(req: NextRequest, context: RouteContext) {
  const { courseId } = await context.params;

  const incomingFormData = await req.formData();
  const file = incomingFormData.get("file") as File;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Empty or missing file" }, { status: 400 });
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course-file/self-learner-course/${courseId}`, {
    method: "POST",
    headers: {
      Cookie: req.headers.get("Cookie") ?? "",
      "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { courseId } = await context.params;

  const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course-file/self-learner-course/${courseId}`, {
    method: "GET",
    headers: {
      Cookie: req.headers.get("Cookie") ?? "",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
