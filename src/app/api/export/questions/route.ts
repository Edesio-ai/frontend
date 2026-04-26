import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/export/questions`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        }
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentDisposition = response.headers.get('content-disposition') ?? 'attachment; filename="questions.pdf"';
    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition,
        },
    });
}