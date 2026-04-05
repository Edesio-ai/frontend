import { redirect } from "next/navigation";
import { getCookie } from "./cookies";
import { authService } from "@/services/auth.service";

export async function apiFetch<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();
    const isMutableMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const csrfToken = isMutableMethod ? getCookie("csrf_token") : null;

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
            ...(options.headers || {})
        },
    });

    if (!response.ok) {
        const { message, code } = await response.json();
        if(code === "TOKEN_USER_NOT_FOUND") {
            await authService.logout();
            redirect("/login");
        }
        throw new Error(message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
}