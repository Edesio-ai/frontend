let isHandlingUnauthorized = false;

export function handleUnauthorizedSession(logout: () => Promise<void>, redirectTo = "/login"): void {
  if (isHandlingUnauthorized) return;

  isHandlingUnauthorized = true;

  void logout()
    .catch((error: unknown) => {
      console.warn("Logout failed after session expiry:", error);
    })
    .finally(() => {
      window.location.assign(redirectTo);
    });
}
