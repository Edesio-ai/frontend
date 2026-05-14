import { apiFetch } from "@/lib/api-client";
import { UpdateProfileBody } from "@/types";

export const profileService = {
  updateProfile: async (data: UpdateProfileBody) => {
    const response = await apiFetch<void>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return response;
  },
};