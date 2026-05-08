import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ code: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
    const { code } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/student-session/join-session/${code}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    return NextResponse.json(null);
}