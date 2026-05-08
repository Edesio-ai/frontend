import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
      token: string;
    }>;
};

export async function GET(request: Request,  { params }: RouteContext) {
    const { token } = await params;

    const response = await fetch(`${process.env.BACKEND_URL}/invitation-token/preview/${token}`);

    if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
}