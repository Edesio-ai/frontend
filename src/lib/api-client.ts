import { redirect } from "next/navigation";
import { getCookie } from "./cookies";
import { authService } from "@/services/auth.service";

export async function apiFetch<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();
    const isMutableMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const csrfToken = isMutableMethod ? getCookie("csrf_token") : null;
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
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
        const code = err?.code;
        
        if (code === "TOKEN_USER_NOT_FOUND") {
            await authService.logout();
            redirect("/login");
        }
        if (code === "ESTABLISHMENT_NOT_FOUND") {
            throw new Error('Establishment not found');
        }
        throw new Error(message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
}