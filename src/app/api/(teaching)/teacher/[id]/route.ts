import { NextResponse } from "next/server";

type context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: context) {
  const { id } = await context.params;

  const response = await fetch(`${process.env.BACKEND_URL}/teacher/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("Cookie") ?? "",
      "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
    },
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ message: error.message }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
