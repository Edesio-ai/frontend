import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();


    const response = await fetch(`${process.env.BACKEND_URL}/billing/checkout-session`, {
        method: "POST",
        body: JSON.stringify(body),
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

    const data = await response.json();
    return NextResponse.json(data);
}