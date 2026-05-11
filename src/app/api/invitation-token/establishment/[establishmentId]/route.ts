import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ establishmentId: string }> }
  ) {
    const { establishmentId } = await params;
    const response = await fetch(`${process.env.BACKEND_URL}/invitation-token/establishment/${establishmentId}`, {
        method: "GET",
        headers: {
            cookie: req.headers.get("cookie") ?? "",
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data)
}
