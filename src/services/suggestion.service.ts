import { apiFetch } from "@/lib/api-client";
import { Suggestion } from "@/types/suggestion.type";

export const suggestionService = {
    async getSuggestions(category: string): Promise<Suggestion[]> {
        const response = await apiFetch<Suggestion[]>(`/api/suggestion/${category}`);
        return response;
    },
};