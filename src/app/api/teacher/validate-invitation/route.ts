import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { token } = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/teacher/validate-invitation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cookie": request.headers.get("cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ data });
}