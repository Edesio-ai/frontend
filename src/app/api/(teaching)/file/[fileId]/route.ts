import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{fileId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { fileId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/file/${fileId}`, {
        method: "DELETE",
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        console.log("🚀 ~ DELETE ~ error:", error)
        return NextResponse.json({ error: error.message }, { status: response.status });
    }
    
    return NextResponse.json({ success: true });
}