import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ courseId: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
    const { courseId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/course/${courseId}/ranking`, {
        method: "GET",
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}