import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ courseId: string }>;
}
export async function POST(request: NextRequest, { params }: RouteContext) {
    const { courseId } = await params;

    const incomingFormData = await request.formData();
    const file = incomingFormData.get("file") as File;

    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
            { message: "Empty or missing file" },
            { status: 400 }
        );
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${process.env.BACKEND_URL}/course/${courseId}/file`, {
        method: "POST",
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}