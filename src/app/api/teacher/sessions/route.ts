import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const response = await fetch(`${process.env.BACKEND_URL}/teacher/sessions`, {
        headers: {
            "cookie": request.headers.get("cookie") ?? ""
        }
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const json = await response.json();
    return NextResponse.json(json);
}