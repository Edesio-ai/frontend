import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const response = await fetch(`${process.env.BACKEND_URL}/student`, {
        method: "GET",
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const response = await fetch(`${process.env.BACKEND_URL}/student`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            'x-csrf-token': request.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return NextResponse.json({ data});
}