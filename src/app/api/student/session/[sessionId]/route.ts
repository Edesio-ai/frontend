import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ sessionId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
    const { sessionId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/student/session/${sessionId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.log("🚀 ~ GET ~ error:", error)
        return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { sessionId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/student/session/${sessionId}`, {
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

    return NextResponse.json({ success: true });
}