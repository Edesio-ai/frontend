import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log("🚀 ~ DELETE ~ id:", request.headers.get("x-csrf-token") ?? "")
    const response = await fetch(`${process.env.BACKEND_URL}/establishment/invitation-token/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
            "cookie": request.headers.get("cookie") || "",
        },
    });

    if(!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.message || "Failed to delete invitation token" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  
}