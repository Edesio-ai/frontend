import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/establishment/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cookie": request.headers.get("cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "An issue occurred during login; please contact customer support.",
                code: error.code || "UNKNOWN_ERROR",
            },
            { status: response.status },
        );
    }

    const data = await response.json();
    const res = NextResponse.json(data);

    return res;
}