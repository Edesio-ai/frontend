import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const response = await fetch(`${process.env.BACKEND_URL}/teacher`, {
        method: "GET",
        headers: {
            "cookie": request.headers.get("cookie") ?? "",
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
            "cookie": request.headers.get("cookie") ?? "",
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