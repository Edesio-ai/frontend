import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/course`, {
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
}