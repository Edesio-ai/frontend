import { getCookie } from "./cookies";

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
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
}