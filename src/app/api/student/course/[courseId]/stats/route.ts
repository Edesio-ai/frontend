import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ courseId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    const { courseId } = await params;
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/student/course/${courseId}/stats`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    return NextResponse.json({ success: true });
}