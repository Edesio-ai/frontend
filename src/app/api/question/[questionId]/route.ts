import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ questionId: string }>;
}

export async function DELETE(request: Request, { params }: RouteContext) {
    const { questionId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/question/${questionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.error }, { status: response.status });
    }

    return NextResponse.json({success: true });
}