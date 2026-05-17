import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log("🚀 ~ POST ~ body:", body)

    const response = await fetch(`${process.env.BACKEND_URL}/suggestion`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        method: "POST",
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data);
}