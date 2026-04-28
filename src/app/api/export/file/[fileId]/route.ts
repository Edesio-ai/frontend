import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ fileId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    const { fileId } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/export/file/${fileId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        console.log("🚀 ~ POST ~ error:", error)
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentDisposition = response.headers.get('content-disposition') ?? 'attachment; filename="course_file.pdf"';
    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition,
        },
    });
}