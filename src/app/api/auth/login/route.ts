import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

    const { user } = await response.json();
    const res = NextResponse.json({ success: true, user });

    const getSetCookie = (response.headers as Headers & {
        getSetCookie?: () => string[];
    }).getSetCookie;

    if (typeof getSetCookie === "function") {
        for (const cookie of getSetCookie.call(response.headers)) {
            res.headers.append("set-cookie", cookie);
        }
    } else {
        // fallback environnements sans getSetCookie
        const raw = response.headers.get("set-cookie");
        if (raw) {
            res.headers.append("set-cookie", raw);
        }
    }

    return res;
}