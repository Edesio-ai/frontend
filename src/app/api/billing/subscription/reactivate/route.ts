import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const response = await fetch(`${process.env.BACKEND_URL}/billing/subscription/reactivate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cookie": request.headers.get("cookie") || "",
            "x-csrf-token": request.headers.get("x-csrf-token") || "",
        },
    });

    if (!response.ok) {
        const { message, code} = await response.json();
        return NextResponse.json({ error: message, code }, { status: response.status });
    }

    return NextResponse.json({ success: true });
}