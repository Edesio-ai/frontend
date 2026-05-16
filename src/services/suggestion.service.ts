import { apiFetch } from "@/lib/api-client";
import { LikeSuggestionResponse, Suggestion } from "@/types/suggestion.type";

export const suggestionService = {
    async getSuggestions(category: string): Promise<Suggestion[]> {
        const response = await apiFetch<Suggestion[]>(`/api/suggestion/category/${category}`);
        return response;
    },
    async likeSuggestion(suggestionId: string): Promise<LikeSuggestionResponse> {
        const response = await apiFetch<LikeSuggestionResponse>(`/api/suggestion/${suggestionId}/like`, {
            method: "POST",
        });
        return response;
    },
};