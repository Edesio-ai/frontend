import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const authToken = req.headers.get("authorization") || "{}";
    
    const response = await fetch(`${process.env.BACKEND_URL}/auth/session/token`, {
        method: "GET",
        headers: {
            "authorization": authToken,
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message || "An error occured while fetching the session by access token" }, { status: response.status });
    }

    const session = await response.json();

    return NextResponse.json({ session });
}