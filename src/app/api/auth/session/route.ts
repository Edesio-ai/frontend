import { NextRequest, NextResponse } from "next/server";

interface Options {
  method: "GET";
  headers: {
    cookie: string;
    authorization?: string;
  };
}

function appendSetCookies(from: Response, to: NextResponse) {
  const getSetCookie = (
    from.headers as Headers & {
      getSetCookie?: () => string[];
    }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    for (const cookie of getSetCookie.call(from.headers)) {
      to.headers.append("set-cookie", cookie);
    }
    return;
  }

  const raw = from.headers.get("set-cookie");
  if (raw) {
    to.headers.append("set-cookie", raw);
  }
}

export async function GET(req: NextRequest) {
  const authToken = req.headers.get("authorization");

  const options: Options = {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  };

  if (authToken) {
    options.headers.authorization = authToken;
  }

  const response = await fetch(`${process.env.BACKEND_URL}/auth/session`, options);

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.message || "An error occured while fetching the session" },
      { status: response.status },
    );
  }

  const { user, role } = await response.json();
  const res = NextResponse.json({ user, role });
  appendSetCookies(response, res);
  return res;
}
