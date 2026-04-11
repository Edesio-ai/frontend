import { NextResponse, NextRequest } from "next/server";

type RouteContext = {
    params: Promise<{ sessionId: string }>;
}
export async function GET(request: NextRequest, { params }: RouteContext) {
    const { sessionId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/session/${sessionId}/courses-count`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { coursesCount } = await response.json();
    return NextResponse.json({ coursesCount });
}