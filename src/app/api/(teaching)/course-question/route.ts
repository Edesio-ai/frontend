import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    
    const response = await fetch(`${process.env.BACKEND_URL}/course-question/`, {
        method: "POST",
        body: JSON.stringify(body),
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