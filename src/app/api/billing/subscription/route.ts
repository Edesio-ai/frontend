import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const response = await fetch(`${process.env.BACKEND_URL}/billing/subscription`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });
    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
}