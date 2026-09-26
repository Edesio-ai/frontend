import type { ApiResponse } from "@/types/teaching/global.type";
import { authenticatedBackendFetch } from "./backend";
import { isReauthRequired } from "./is-reauth-required";

type BackendErrorBody = {
  code?: string;
  message?: string;
};

export async function authenticatedRequest<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const response = await authenticatedBackendFetch(url, init);

  if (response.ok) {
    const text = await response.text();
    const data = (text ? JSON.parse(text) : undefined) as T;
    return { ok: true, data };
  }

  const error = (await response.json().catch(() => ({}))) as BackendErrorBody;
  const code = error.code ?? "UNKNOWN";
  const message = error.message ?? "Request failed";

  return {
    ok: false,
    code,
    message,
    status: response.status,
    requiresReauth: isReauthRequired(response.status),
  };
}
