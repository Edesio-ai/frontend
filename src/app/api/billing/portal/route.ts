import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const response = await fetch(`${process.env.BACKEND_URL}/billing/portal`, {
        method: "GET",
        headers: {
            cookie: request.headers.get("cookie") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const url = await response.json();
    return NextResponse.json(url);
}