import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/auth/sign-up/teacher`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "cookie": request.headers.get("cookie") || "",
            "x-csrf-token": request.headers.get("x-csrf-token")|| "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message || "Failed to register teacher" }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
}