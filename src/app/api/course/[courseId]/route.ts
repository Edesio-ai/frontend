import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ courseId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { courseId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/course/${courseId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
}