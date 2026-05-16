import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ suggestionId: string }>;
}
export async function POST(request: Request,  { params }: RouteContext) {
    const { suggestionId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/suggestion/${suggestionId}/like`, {
        method: "POST",
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const suggestion = await response.json();
    return NextResponse.json(suggestion);
}