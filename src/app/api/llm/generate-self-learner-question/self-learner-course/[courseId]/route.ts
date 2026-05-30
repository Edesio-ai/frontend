import { NextRequest, NextResponse } from "next/server";

type routeContext = {
    params: Promise<{ courseId: string }>;
}
export async function POST(req: NextRequest, context: routeContext) {
    const { courseId } = await context.params;
    const body = await req.json();

    const response = await fetch(`${process.env.BACKEND_URL}/llm/generate-self-learner-question/self-learner-course/${courseId}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "cookie": req.headers.get("cookie") ?? "",
            "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}