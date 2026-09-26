import type { InvitationTokenPreview } from "@/types/invitation-token.type";
import type { ApiResponse } from "@/types/teaching/global.type";
import { backendFetch } from "../http/backend";

const readString = (...values: unknown[]) => {
  const value = values.find((candidate) => typeof candidate === "string" && candidate.length > 0);
  return typeof value === "string" ? value : "";
};

const normalizeInvitationPreview = (data: Record<string, unknown>): InvitationTokenPreview => ({
  firstname: readString(data.firstname, data.firstName, data.first_name),
  lastname: readString(data.lastname, data.lastName, data.last_name),
  invitedEmail: readString(data.invitedEmail, data.invited_email),
  maskedEmail: readString(data.maskedEmail, data.masked_email),
  establishmentName: readString(data.establishmentName, data.establishment_name),
  assignedChatbots: Number(data.assignedChatbots ?? data.assigned_chatbots ?? 0) || undefined,
});

export const getInvitationPreview = async (token: string): Promise<ApiResponse<InvitationTokenPreview>> => {
  const response = await backendFetch(`/invitation-token/preview/${token}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
    return {
      ok: false,
      code: error.code ?? "UNKNOWN",
      message: error.message ?? "Invitation preview failed",
      status: response.status,
    };
  }

  const data = (await response.json()) as Record<string, unknown>;
  return { ok: true, data: normalizeInvitationPreview(data) };
};
