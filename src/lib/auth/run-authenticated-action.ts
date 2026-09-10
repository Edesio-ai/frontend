import type { ApiResponse } from "@/types/teaching/global.type";
import { handleUnauthorizedSession } from "./handle-unauthorized-session";

export async function runAuthenticatedAction<T>(
  action: () => Promise<ApiResponse<T>>,
  logout: () => Promise<void>,
): Promise<ApiResponse<T> | null> {
  const result = await action();

  if (!result.ok && result.requiresReauth) {
    handleUnauthorizedSession(logout);
    return null;
  }

  return result;
}
