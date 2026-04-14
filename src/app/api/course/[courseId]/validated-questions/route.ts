import { NextRequest, NextResponse } from "next/server";

type RouteContexte = {
    params: Promise<{ courseId: string }>
}
export async function GET(request: NextRequest, { params }: RouteContexte) {
  const { courseId } = await params;

  const response = await fetch(`${process.env.BACKEND_URL}/course/${courseId}/validated-questions`, {
    method: 'GET',
    headers: {
        'Cookie': request.headers.get('Cookie') ?? '',
    },
  });


  if(!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}