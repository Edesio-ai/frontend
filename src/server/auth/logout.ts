import type { ApiResponse } from "@/types/teaching/global.type";
import { authenticatedBackendFetch } from "../http/backend";
import { applyBackendSetCookies, getCsrfToken } from "../http/cookies";

type LogoutResult = { success: true };

export async function logout(): Promise<ApiResponse<LogoutResult>> {
  const response = await authenticatedBackendFetch("/auth/logout", {
    method: "POST",
    headers: {
      "x-csrf-token": await getCsrfToken(),
    },
  });

  await applyBackendSetCookies(response);

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
    return {
      ok: false,
      code: error.code ?? "UNKNOWN",
      message: error.message ?? "Logout failed",
      status: response.status,
    };
  }

  return { ok: true, data: { success: true } };
}
