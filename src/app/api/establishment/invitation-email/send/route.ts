import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/auth/send-invitation`, {
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
        return NextResponse.json({ error: error.message, code: response.status }, { status: response.status });
    }

    const json = await response.json();
    return NextResponse.json(json);
}