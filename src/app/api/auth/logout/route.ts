import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const response = await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": req.headers.get("Cookie") ?? "",
            "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
        },
    });
    const payload = await response.json().catch(() => ({}));
    const res = NextResponse.json(payload, { status: response.status });

    const getSetCookie = (response.headers as Headers & {
        getSetCookie?: () => string[];
    }).getSetCookie;

    if (typeof getSetCookie === "function") {
        for (const cookie of getSetCookie.call(response.headers)) {
            res.headers.append("set-cookie", cookie);
        }
    } else {
        const raw = response.headers.get("set-cookie");
        if (raw) {
            res.headers.append("set-cookie", raw);
        }
    }

    return res;
}