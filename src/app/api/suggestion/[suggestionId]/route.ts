import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ suggestionId: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { suggestionId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/suggestion/${suggestionId}`, {
        method: "DELETE",
        headers: {
            "Cookie": request.headers.get("cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    return NextResponse.json({ success: true });
}