import { cookies } from "next/headers";

const readSetCookieHeaders = (response: Response): string[] => {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }; // voir si pas possible de faire autrement

  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
};

const parseSetCookie = (raw: string): { name: string; value: string } | null => {
  const [pair] = raw.split(";");
  const separator = pair.indexOf("=");

  if (separator === 0) return null;

  return {
    name: pair.slice(0, separator).trim(),
    value: pair.slice(separator + 1).trim(),
  };
};

export async function applyBackendSetCookies(response: Response): Promise<void> {
  const jar = await cookies();
  for (const raw of readSetCookieHeaders(response)) {
    const parsed = parseSetCookie(raw);
    if (!parsed) continue;
    jar.set(parsed.name, parsed.value, {
      httpOnly: raw.toLowerCase().includes("httponly"),
      secure: raw.toLowerCase().includes("secure"),
      path: "/",
      sameSite: "lax",
    });
  }
}
