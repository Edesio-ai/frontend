import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const response = await fetch(`${process.env.BACKEND_URL}/auth/csrf`, {
        method: "GET",
        headers: {
            cookie: req.headers.get("cookie") ?? "",
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
