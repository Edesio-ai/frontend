import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ category: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
    const { category } = await params;
    const response = await fetch(`${process.env.BACKEND_URL}/suggestion/category/${category}`,{
        headers: {
            "Cookie": request.headers.get("Cookie") ?? "",
        }
    })

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message, code: error.code }, { status: response.status });
    }

    const suggestions = await response.json();
    return NextResponse.json(suggestions);
}