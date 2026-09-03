import { getCookie } from "./cookies";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api-error";

let csrfInitPromise: Promise<unknown> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  const existing = getCookie("csrf_token");
  if (existing) return existing;

  if (!csrfInitPromise) {
    csrfInitPromise = authService.initCsrf().finally(() => {
      csrfInitPromise = null;
    });
  }

  try {
    await csrfInitPromise;
  } catch {
    return null;
  }

  return getCookie("csrf_token");
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isMutableMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isCsrfBootstrap = url.includes("/api/auth/csrf");
  const csrfToken = isMutableMethod && !isCsrfBootstrap ? await ensureCsrfToken() : null;
  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message =
      (typeof err?.message === "string" && err.message) ||
      (typeof err?.error === "string" && err.error) ||
      (typeof err?.error?.message === "string" && err.error.message) ||
      `HTTP ${response.status}`;
    const code = typeof err?.code === "string" ? err.code : undefined;
    if (code === "TOKEN_USER_NOT_FOUND") {
      await authService.logout();
      window.location.href = "/login";
    }
    if (code === "ESTABLISHMENT_NOT_FOUND") {
      throw new ApiError("Establishment not found", code);
    }
    throw new ApiError(message || `HTTP ${response.status}`, code);
  }

  return response.json() as Promise<T>;
}
