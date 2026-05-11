import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const response = await fetch(`${process.env.BACKEND_URL}/teacher`, {
        method: "GET",
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }
    const teacher = await response.json();
    return NextResponse.json(teacher);
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/teacher`, {
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
        return NextResponse.json({ error: error.message }, { status: response.status });
    }
    const teacher = await response.json();
    return NextResponse.json(teacher);
}