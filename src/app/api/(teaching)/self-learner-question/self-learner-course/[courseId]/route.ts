import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ courseId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
    const { courseId } = await context.params;

    const response = await fetch(`${process.env.BACKEND_URL}/self-learner-question/self-learner-course/${courseId}`, {
        method: "GET",
        headers: {
            "cookie": req.headers.get("cookie") ?? "",
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}