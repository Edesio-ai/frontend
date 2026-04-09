import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
      code: string;
    }>;
};

export async function GET(request: Request, { params }: RouteContext) {
    const { code } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/teacher/sessions/${code}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cookie": request.headers.get("cookie") ?? "",
        },
    });
    
    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }
    
    const session = await response.json();
    return NextResponse.json(session);
}