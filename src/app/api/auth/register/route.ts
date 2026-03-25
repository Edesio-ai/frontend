import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ success: false,  message: error.message || "An issue occurred during registration; please contact customer support.", code: error.code || "UNKNOWN_ERROR"}, { status: response.status });
    }

    const res = NextResponse.json({ success: true });
    
    return res;
}