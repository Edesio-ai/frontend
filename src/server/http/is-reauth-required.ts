export function isReauthRequired(status: number): boolean {
  return status === 401;
}
