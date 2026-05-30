import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export type routeContext = {
    params: Promise<{ questionId: string }>;
}

export async function PATCH(req: NextRequest, context: routeContext) {
    const { questionId } = await context.params;
    const body = await req.json();

    const response = await fetch(`${process.env.BACKEND_URL}/self-learner-question/${questionId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "cookie": req.headers.get("cookie") ?? "",
            "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
    }

    const question = await response.json();
    return NextResponse.json(question);
}

export async function DELETE(req: NextRequest, context: routeContext) {
    const { questionId } = await context.params;

    const response = await fetch(`${process.env.BACKEND_URL}/self-learner-question/${questionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "cookie": req.headers.get("cookie") ?? "",
            "x-csrf-token": req.headers.get("x-csrf-token") ?? "",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error?.code }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: "Question deleted" });
}