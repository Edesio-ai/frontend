import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const response = await fetch(`${process.env.BACKEND_URL}/question/answered/`, {
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}