export type ApiResponse<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string; status: number; requiresReauth?: boolean };
