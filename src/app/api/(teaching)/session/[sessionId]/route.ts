import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ 
        sessionId: string 
    }>;
};

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const { sessionId } = await params;
   
    const response = await fetch(`${process.env.BACKEND_URL}/session/${sessionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
    });
    if (!response.ok) {
        const error = await response.json();    
        return NextResponse.json({ message: error.message }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
    const { sessionId } = await params;
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/session/${sessionId}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        method: "PUT",
        body: JSON.stringify(body),
    });

    if(!response.ok) {
        const error = await response.json();
        console.log("🚀 ~ PUT ~ error:", error)
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const session = await response.json();
    return NextResponse.json(session);
}