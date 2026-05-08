import { apiFetch } from "@/lib/api-client";

export const establishmentService = {
    async getEstablishmentStats(): Promise<any> {
        const response = await apiFetch("/api/establishment/stats");
        return response;
    },
    async createEstablishment(supabaseUserId: string, name: string, email: string): Promise<any> {
        const body = {
            supabaseUserId,
            name,
            email,
        }
        const response = await apiFetch("/api/establishment/create", {
            method: "POST",
            body: JSON.stringify(body),
        });
        return response;
    },
}