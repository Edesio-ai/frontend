import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ courseId: string }>;
}
export async function PATCH(req: NextRequest, context: RouteContext) {
    const { courseId } = await context.params;

    const body = await req.json();

    const response = await fetch(`${process.env.BACKEND_URL}/self-learner-course/${courseId}`, {
        method: "PATCH",
        headers: {
            "cookie": req.headers.get("cookie") ?? "",
            "Content-Type": "application/json",
            "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
        },
        body: JSON.stringify(body),
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}