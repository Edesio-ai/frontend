export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${process.env.BACKEND_URL}/llm/completion-feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": request.headers.get("Cookie") ?? "",
      "x-csrf-token": request.headers.get("x-csrf-token") ?? "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return Response.json({ error: error.message, code: error.code }, { status: response.status });
  }
  const data = await response.json();
  return Response.json(data);
}