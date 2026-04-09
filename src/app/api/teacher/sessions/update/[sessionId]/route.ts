import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ sessionId: string }>;
   
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    const { sessionId } = await params;
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/teacher/sessions/${sessionId}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        method: "PUT",
        body: JSON.stringify(body),
    });

    if(!response.ok) {
        const error = await response.json();
        console.log("🚀 ~ PUT ~ error:", error)
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const session = await response.json();
    return NextResponse.json(session);
}