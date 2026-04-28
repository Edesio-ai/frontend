import { apiFetch } from "@/lib/api-client";

export const fileService = {
    deleteFile: async (fileId: string): Promise<void> => {
        const response = await apiFetch<void>(`/api/file/${fileId}`, {
            method: "DELETE",
        });
        return response;
    },
}